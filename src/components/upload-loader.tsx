'use client'

import React from 'react'
import { MagicCard } from '@/components/magicui/magic-card'
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { GridPattern } from '@/components/magicui/grid-pattern'
import { Upload, CheckCircle, AlertCircle, FileText, Image, Video, Music } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadLoaderProps {
  isVisible: boolean
  progress: number
  fileName?: string
  fileType?: string
  status: 'uploading' | 'success' | 'error'
  onClose?: () => void
}

export default function UploadLoader({
  isVisible,
  progress,
  fileName = 'Uploading...',
  fileType = '',
  status,
  onClose
}: UploadLoaderProps) {
  if (!isVisible) return null

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image
    if (type.startsWith('video/')) return Video
    if (type.startsWith('audio/')) return Music
    return FileText
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return Upload
      case 'success':
        return CheckCircle
      case 'error':
        return AlertCircle
      default:
        return Upload
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
        return 'text-blue-400'
      case 'success':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-blue-400'
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'uploading':
        return 'Uploading your file...'
      case 'success':
        return 'Upload completed successfully!'
      case 'error':
        return 'Upload failed. Please try again.'
      default:
        return 'Processing...'
    }
  }

  const FileIcon = getFileIcon(fileType)
  const StatusIcon = getStatusIcon()

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <MagicCard className="p-8 bg-gray-900/95 border border-gray-700 relative overflow-hidden">
          {/* Animated Background Pattern */}
          <GridPattern
            squares={[
              [1, 1], [2, 3], [4, 2], [3, 1], [5, 4], [2, 2], [4, 4], [1, 3]
            ]}
            className={cn(
              "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
              "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 opacity-30",
              status === 'uploading' && "animate-pulse"
            )}
          />

          <div className="relative z-10 text-center">
            {/* File Icon */}
            <div className="flex justify-center mb-4">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                status === 'uploading' && "border-blue-400 bg-blue-400/10 animate-pulse",
                status === 'success' && "border-green-400 bg-green-400/10",
                status === 'error' && "border-red-400 bg-red-400/10"
              )}>
                <FileIcon className={cn("h-8 w-8", getStatusColor())} />
              </div>
            </div>

            {/* Status Icon & Message */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <StatusIcon className={cn(
                "h-5 w-5 transition-all duration-300",
                getStatusColor(),
                status === 'uploading' && "animate-spin"
              )} />
              <AnimatedShinyText className="text-lg font-semibold">
                {getStatusMessage()}
              </AnimatedShinyText>
            </div>

            {/* File Name */}
            <div className="mb-6">
              <p className="text-white font-medium truncate">{fileName}</p>
              {fileType && (
                <p className="text-gray-400 text-sm mt-1">{fileType}</p>
              )}
            </div>

            {/* Progress Bar */}
            {status === 'uploading' && (
              <div className="mb-6">
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out relative"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>{Math.round(progress)}%</span>
                  <span>{progress < 100 ? 'Uploading...' : 'Processing...'}</span>
                </div>
              </div>
            )}

            {/* Success/Error Actions */}
            {status !== 'uploading' && (
              <div className="flex justify-center">
                {status === 'success' ? (
                  <RainbowButton onClick={onClose} className="px-6">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Done
                  </RainbowButton>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Close
                    </button>
                    <RainbowButton onClick={onClose} className="px-4">
                      Try Again
                    </RainbowButton>
                  </div>
                )}
              </div>
            )}

            {/* Uploading Animation Dots */}
            {status === 'uploading' && (
              <div className="flex justify-center gap-1 mt-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2 h-2 bg-blue-400 rounded-full animate-bounce",
                      `animation-delay-${i * 200}`
                    )}
                    style={{
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </MagicCard>
      </div>
    </div>
  )
}