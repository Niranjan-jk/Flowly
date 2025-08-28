'use client'

import React, { useState, useRef } from 'react'
import { MagicCard } from '@/components/magicui/magic-card'
import { 
  File, 
  Image, 
  Video, 
  FileText, 
  Music,
  Archive,
  Code,
  Download,
  Eye,
  Trash2,
  MoreVertical,
  Play,
  Pause
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface ClientFile {
  id: string
  name: string
  file_type: string
  file_size: number
  file_url: string
  folder_id: string
  created_at: string
  user_id: string
}

interface EnhancedFilePreviewProps {
  file: ClientFile
  onDelete: (fileId: string) => void
  className?: string
}

export default function EnhancedFilePreview({ 
  file, 
  onDelete, 
  className 
}: EnhancedFilePreviewProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image
    if (fileType.startsWith('video/')) return Video
    if (fileType.startsWith('audio/')) return Music
    if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) return FileText
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return Archive
    if (fileType.includes('javascript') || fileType.includes('html') || fileType.includes('css') || fileType.includes('json')) return Code
    return File
  }

  const getFileTypeColor = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'text-green-400'
    if (fileType.startsWith('video/')) return 'text-purple-400'
    if (fileType.startsWith('audio/')) return 'text-yellow-400'
    if (fileType.includes('pdf')) return 'text-red-400'
    if (fileType.includes('document')) return 'text-blue-400'
    if (fileType.includes('zip') || fileType.includes('rar')) return 'text-orange-400'
    return 'text-gray-400'
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleVideoHover = (play: boolean) => {
    if (videoRef.current) {
      if (play && !videoPlaying) {
        videoRef.current.play().then(() => {
          setVideoPlaying(true)
        }).catch(() => {
          // Video play failed, ignore silently
        })
      } else if (!play && videoPlaying) {
        videoRef.current.pause()
        setVideoPlaying(false)
      }
    }
  }

  const isImage = file.file_type.startsWith('image/')
  const isVideo = file.file_type.startsWith('video/')
  const isPDF = file.file_type.includes('pdf')
  const IconComponent = getFileIcon(file.file_type)

  return (
    <div
      className={cn("cursor-pointer", className)}
      onMouseEnter={() => {
        setIsHovered(true)
        if (isVideo) handleVideoHover(true)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
        if (isVideo) handleVideoHover(false)
      }}
    >
      <MagicCard
        className={cn(
          "p-4 transition-all duration-300 relative group h-full",
          "hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25",
          isHovered && "scale-105"
        )}
      >
        {/* Actions Menu */}
        <div className={cn(
          "absolute top-2 right-2 z-10 transition-all duration-200",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20"
              >
                <MoreVertical className="h-4 w-4 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={file.file_url} download={file.name}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(file.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* File Preview */}
        <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden bg-gray-800/50">
          {isImage && !imageError ? (
            <div className="relative w-full h-full">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                </div>
              )}
              <img 
                src={file.file_url} 
                alt={file.name}
                className={cn(
                  "w-full h-full object-cover transition-all duration-300",
                  isHovered && "scale-110",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
              {/* Image Overlay on Hover */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300",
                isHovered ? "opacity-100" : "opacity-0"
              )}>
                <div className="absolute bottom-2 left-2 text-white text-xs font-medium">
                  {formatFileSize(file.file_size)}
                </div>
              </div>
            </div>
          ) : isVideo ? (
            <div className="relative w-full h-full group">
              <video
                ref={videoRef}
                className={cn(
                  "w-full h-full object-cover transition-all duration-300",
                  isHovered && "scale-110"
                )}
                muted
                loop
                preload="metadata"
                poster={`${file.file_url}#t=1`}
              >
                <source src={file.file_url} type={file.file_type} />
              </video>
              
              {/* Video Play/Pause Indicator */}
              <div className={cn(
                "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                isHovered && !videoPlaying ? "opacity-100" : "opacity-0"
              )}>
                <div className="bg-black/50 rounded-full p-3 backdrop-blur-sm">
                  {videoPlaying ? (
                    <Pause className="h-6 w-6 text-white" />
                  ) : (
                    <Play className="h-6 w-6 text-white ml-1" />
                  )}
                </div>
              </div>

              {/* Video Overlay */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300",
                isHovered ? "opacity-100" : "opacity-0"
              )}>
                <div className="absolute bottom-2 left-2 text-white text-xs font-medium">
                  Video • {formatFileSize(file.file_size)}
                </div>
              </div>
            </div>
          ) : isPDF ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className={cn(
                "transition-all duration-300",
                isHovered && "scale-110"
              )}>
                <IconComponent className={cn("h-12 w-12", getFileTypeColor(file.file_type))} />
              </div>
              <div className="mt-2 text-xs text-gray-400 text-center">
                PDF Document
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className={cn(
                "transition-all duration-300",
                isHovered && "scale-110"
              )}>
                <IconComponent className={cn("h-12 w-12", getFileTypeColor(file.file_type))} />
              </div>
              <div className="mt-2 text-xs text-gray-400 text-center">
                {file.file_type.split('/')[1]?.toUpperCase() || 'File'}
              </div>
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white truncate" title={file.name}>
            {file.name}
          </h4>
          
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span className={cn(
              "transition-colors duration-200",
              isHovered && "text-white"
            )}>
              {formatFileSize(file.file_size)}
            </span>
            <span className={cn(
              "transition-colors duration-200",
              isHovered && "text-gray-300"
            )}>
              {new Date(file.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* File Type Badge */}
          <div className="flex justify-start">
            <span className={cn(
              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all duration-200",
              "bg-gray-700/50 text-gray-300",
              isHovered && "bg-gray-600/70 text-white scale-105"
            )}>
              <IconComponent className={cn("h-3 w-3 mr-1", getFileTypeColor(file.file_type))} />
              {file.file_type.split('/')[0]}
            </span>
          </div>
        </div>
      </MagicCard>
    </div>
  )
}