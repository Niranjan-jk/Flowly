'use client'

import React, { useState, useEffect } from 'react'
import { MagicCard } from '@/components/magicui/magic-card'
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { GridPattern } from '@/components/magicui/grid-pattern'
import NavigationDock from '@/components/navigation-dock'
import EnhancedFilePreview from '@/components/enhanced-file-preview'
import UploadLoader from '@/components/upload-loader'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  FolderOpen, 
  Upload, 
  File,
  Plus,
  ArrowLeft,
  MoreVertical,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface ClientFolder {
  id: string
  name: string
  description: string
  created_at: string
  file_count: number
  user_id: string
}

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

export default function ClientDocsPage() {
  const [folders, setFolders] = useState<ClientFolder[]>([])
  const [currentFolder, setCurrentFolder] = useState<ClientFolder | null>(null)
  const [files, setFiles] = useState<ClientFile[]>([])
  const [loading, setLoading] = useState(true)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderDescription, setNewFolderDescription] = useState('')
  const [folderDialogOpen, setFolderDialogOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadLoaderVisible, setUploadLoaderVisible] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'uploading' | 'success' | 'error'>('uploading')
  const [uploadingFileName, setUploadingFileName] = useState('')
  const [uploadingFileType, setUploadingFileType] = useState('')

  useEffect(() => {
    loadFolders()
  }, [])

  useEffect(() => {
    if (currentFolder) {
      loadFiles(currentFolder.id)
    }
  }, [currentFolder])

  const loadFolders = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('client_folders')
        .select(`
          *,
          client_files!folder_id(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading folders:', error)
        toast.error('Failed to load client folders')
      } else {
        const formattedFolders = (data || []).map(folder => ({
          ...folder,
          file_count: folder.client_files?.[0]?.count || 0
        }))
        setFolders(formattedFolders)
      }
    } catch (err) {
      console.error('Error:', err)
      toast.error('Failed to load folders')
    } finally {
      setLoading(false)
    }
  }

  const loadFiles = async (folderId: string) => {
    try {
      const { data, error } = await supabase
        .from('client_files')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading files:', error)
        toast.error('Failed to load files')
      } else {
        setFiles(data || [])
      }
    } catch (err) {
      console.error('Error:', err)
      toast.error('Failed to load files')
    }
  }

  const createFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('User not authenticated')
        return
      }

      const { error } = await supabase
        .from('client_folders')
        .insert([{
          name: newFolderName,
          description: newFolderDescription,
          user_id: user.id
        }])

      if (error) {
        console.error('Error creating folder:', error)
        toast.error('Failed to create folder')
      } else {
        toast.success('Folder created successfully!')
        setNewFolderName('')
        setNewFolderDescription('')
        setFolderDialogOpen(false)
        loadFolders()
      }
    } catch (err) {
      console.error('Error:', err)
      toast.error('Failed to create folder')
    }
  }

  const deleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder and all its files?')) return

    try {
      // First delete all files in the folder
      const { error: filesError } = await supabase
        .from('client_files')
        .delete()
        .eq('folder_id', folderId)

      if (filesError) {
        console.error('Error deleting files:', filesError)
        toast.error('Failed to delete folder files')
        return
      }

      // Then delete the folder
      const { error } = await supabase
        .from('client_folders')
        .delete()
        .eq('id', folderId)

      if (error) {
        console.error('Error deleting folder:', error)
        toast.error('Failed to delete folder')
      } else {
        toast.success('Folder deleted successfully!')
        setCurrentFolder(null)
        loadFolders()
      }
    } catch (err) {
      console.error('Error:', err)
      toast.error('Failed to delete folder')
    }
  }

  const deleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const { error } = await supabase
        .from('client_files')
        .delete()
        .eq('id', fileId)

      if (error) {
        console.error('Error deleting file:', error)
        toast.error('Failed to delete file')
      } else {
        toast.success('File deleted successfully!')
        if (currentFolder) {
          loadFiles(currentFolder.id)
        }
        loadFolders() // Refresh to update file counts
      }
    } catch (err) {
      console.error('Error:', err)
      toast.error('Failed to delete file')
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !currentFolder) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('User not authenticated')
        return
      }

      // Show upload loader
      setUploadingFileName(file.name)
      setUploadingFileType(file.type)
      setUploadProgress(0)
      setUploadStatus('uploading')
      setUploadLoaderVisible(true)
      setUploadDialogOpen(false)

      // Validate folder ownership before proceeding
      const { data: folderData, error: folderError } = await supabase
        .from('client_folders')
        .select('user_id')
        .eq('id', currentFolder.id)
        .eq('user_id', user.id)
        .single()

      if (folderError || !folderData) {
        console.error('Folder ownership validation failed:', folderError)
        setUploadStatus('error')
        toast.error('Access denied: You can only upload to your own folders')
        return
      }

      // Simulate initial progress
      setUploadProgress(10)

      // Upload file to Supabase Storage with improved path structure
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      // Try multiple path formats for better RLS compatibility
      const filePaths = [
        `${user.id}/${currentFolder.id}/${fileName}`, // Simple user/folder structure
        `client-docs/${user.id}/${currentFolder.id}/${fileName}`, // Original structure
        `${user.id}/${fileName}` // Fallback: just user ID
      ]

      setUploadProgress(30)

      let uploadData = null
      let uploadError: any = null
      let usedPath = ''
      
      // Try uploading with different path structures
      for (const filePath of filePaths) {
        try {
          const result = await supabase.storage
            .from('client-files')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
              contentType: file.type
            })
          
          if (!result.error) {
            uploadData = result.data
            usedPath = filePath
            uploadError = null
            break
          } else {
            uploadError = result.error
          }
        } catch (err) {
          uploadError = err
          continue
        }
      }

      if (uploadError) {
        console.error('Error uploading file with all path structures:', uploadError)
        setUploadStatus('error')
        
        // More specific error handling
        const errorMessage = uploadError?.message || String(uploadError)
        if (errorMessage.includes('row-level security')) {
          toast.error('Storage access denied. Please check if the storage bucket policies are correctly configured.')
        } else if (errorMessage.includes('duplicate')) {
          toast.error('A file with this name already exists.')
        } else {
          toast.error(`Upload failed: ${errorMessage}`)
        }
        return
      }

      setUploadProgress(70)

      // Get public URL using the successful path
      const { data: { publicUrl } } = supabase.storage
        .from('client-files')
        .getPublicUrl(usedPath)

      setUploadProgress(90)

      // Save file record to database
      const { error: dbError } = await supabase
        .from('client_files')
        .insert([{
          name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_url: publicUrl,
          folder_id: currentFolder.id,
          user_id: user.id
        }])

      if (dbError) {
        console.error('Error saving file record:', dbError)
        setUploadStatus('error')
        
        // Clean up uploaded file if database insert fails
        await supabase.storage
          .from('client-files')
          .remove([usedPath])
          
        if (dbError.message.includes('row-level security')) {
          toast.error('Database access denied. Please check your permissions.')
        } else {
          toast.error(`Failed to save file record: ${dbError.message}`)
        }
      } else {
        setUploadProgress(100)
        setUploadStatus('success')
        toast.success('File uploaded successfully!')
        
        // Refresh data
        loadFiles(currentFolder.id)
        loadFolders() // Refresh to update file counts
        
        // Auto-close after 2 seconds on success
        setTimeout(() => {
          setUploadLoaderVisible(false)
        }, 2000)
      }
    } catch (err) {
      console.error('Error:', err)
      setUploadStatus('error')
      toast.error('Failed to upload file')
    }

    // Reset file input
    event.target.value = ''
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="animate-pulse text-white">Loading client docs...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="border-b border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentFolder && (
                <Button
                  variant="ghost"
                  onClick={() => setCurrentFolder(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Folders
                </Button>
              )}
              <div>
                <AnimatedShinyText className="text-3xl font-bold">
                  {currentFolder ? currentFolder.name : 'Client Documents'}
                </AnimatedShinyText>
                <p className="text-gray-400 mt-1">
                  {currentFolder 
                    ? currentFolder.description || 'Manage documents and assets for this client'
                    : 'Organize and manage documents and assets for your clients'
                  }
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {currentFolder ? (
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <RainbowButton>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </RainbowButton>
                  </DialogTrigger>
                  <DialogContent className="border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Upload File</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="file-upload" className="text-white">Select File</Label>
                        <Input
                          id="file-upload"
                          type="file"
                          onChange={handleFileUpload}
                          className="bg-gray-700 border-gray-600 text-white"
                          accept="*"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Upload images, videos, documents, or any other files
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
                  <DialogTrigger asChild>
                    <RainbowButton>
                      <Plus className="h-4 w-4 mr-2" />
                      New Folder
                    </RainbowButton>
                  </DialogTrigger>
                  <DialogContent className="border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Create New Client Folder</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="folder-name" className="text-white">Client Name</Label>
                        <Input
                          id="folder-name"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          placeholder="Enter client name..."
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="folder-description" className="text-white">Description (Optional)</Label>
                        <Textarea
                          id="folder-description"
                          value={newFolderDescription}
                          onChange={(e) => setNewFolderDescription(e.target.value)}
                          placeholder="Brief description of the client..."
                          className="bg-gray-700 border-gray-600 text-white"
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => setFolderDialogOpen(false)}
                          className="border-gray-600 text-gray-300"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={createFolder}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Create Folder
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentFolder ? (
          /* Folders Grid */
          folders.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No client folders yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Create your first client folder to start organizing documents
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="cursor-pointer"
                  onClick={() => setCurrentFolder(folder)}
                >
                  <MagicCard
                    className="p-6 hover:scale-105 transition-transform duration-200 relative group rounded-lg"
                  >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteFolder(folder.id)
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <GridPattern
                    squares={[[1, 1], [2, 3], [4, 2], [3, 1]]}
                    className={cn(
                      "[mask-image:radial-gradient(200px_circle_at_center,white,transparent)]",
                      "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 opacity-20"
                    )}
                  />
                  <div className="relative z-10">
                    <FolderOpen className="h-8 w-8 text-blue-400 mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">{folder.name}</h3>
                    {folder.description && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {folder.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{folder.file_count} files</span>
                      <span>{new Date(folder.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </MagicCard>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Files Grid */
          files.length === 0 ? (
            <div className="text-center py-12">
              <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No files uploaded yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Upload documents, images, videos, and other assets for this client
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {files.map((file) => (
                <EnhancedFilePreview
                  key={file.id}
                  file={file}
                  onDelete={deleteFile}
                  className="h-full"
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Navigation Dock */}
      <NavigationDock />
      
      {/* Upload Loader */}
      <UploadLoader
        isVisible={uploadLoaderVisible}
        progress={uploadProgress}
        fileName={uploadingFileName}
        fileType={uploadingFileType}
        status={uploadStatus}
        onClose={() => setUploadLoaderVisible(false)}
      />
    </div>
  )
}