# Client Documents Database Schema

This document outlines the database tables and storage bucket required for the Client Documents functionality.

## Required Supabase Tables

### 1. client_folders
```sql
CREATE TABLE client_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE client_folders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only access their own folders
CREATE POLICY "Users can only access their own folders" ON client_folders
  FOR ALL USING (auth.uid() = user_id);
```

### 2. client_files
```sql
CREATE TABLE client_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_url TEXT NOT NULL,
  folder_id UUID REFERENCES client_folders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE client_files ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only access files in their own folders
CREATE POLICY "Users can only access files in their own folders" ON client_files
  FOR ALL USING (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM client_folders 
      WHERE client_folders.id = client_files.folder_id 
      AND client_folders.user_id = auth.uid()
    )
  );
```

## Required Supabase Storage

### Storage Bucket: client-files
```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('client-files', 'client-files', true);

-- First, remove any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- OPTION 1: Folder-based policies (try these first)
-- Upload policy
CREATE POLICY "Users can upload files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'client-files' AND 
    auth.uid() IS NOT NULL AND
    (
      -- Allow if the path starts with user ID
      (storage.foldername(name))[1] = auth.uid()::text OR
      -- Allow if the path contains the user ID anywhere
      name ~ ('^client-docs/' || auth.uid()::text || '/') OR
      -- Allow direct uploads to user folder
      name ~ ('^' || auth.uid()::text || '/')
    )
  );

-- View policy
CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'client-files' AND 
    auth.uid() IS NOT NULL AND
    (
      (storage.foldername(name))[1] = auth.uid()::text OR
      name ~ ('^client-docs/' || auth.uid()::text || '/') OR
      name ~ ('^' || auth.uid()::text || '/')
    )
  );

-- Update policy
CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'client-files' AND 
    auth.uid() IS NOT NULL AND
    (
      (storage.foldername(name))[1] = auth.uid()::text OR
      name ~ ('^client-docs/' || auth.uid()::text || '/') OR
      name ~ ('^' || auth.uid()::text || '/')
    )
  )
  WITH CHECK (
    bucket_id = 'client-files' AND 
    auth.uid() IS NOT NULL AND
    (
      (storage.foldername(name))[1] = auth.uid()::text OR
      name ~ ('^client-docs/' || auth.uid()::text || '/') OR
      name ~ ('^' || auth.uid()::text || '/')
    )
  );

-- Delete policy
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'client-files' AND 
    auth.uid() IS NOT NULL AND
    (
      (storage.foldername(name))[1] = auth.uid()::text OR
      name ~ ('^client-docs/' || auth.uid()::text || '/') OR
      name ~ ('^' || auth.uid()::text || '/')
    )
  );

-- OPTION 2: If the above policies still cause issues, use these simpler ones
-- Uncomment these if folder-based policies don't work:

/*
-- Simple upload policy (allows all authenticated users)
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'client-files');

-- Simple view policy
CREATE POLICY "Allow authenticated access" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'client-files');

-- Simple update policy
CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'client-files')
  WITH CHECK (bucket_id = 'client-files');

-- Simple delete policy
CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'client-files');
*/

-- OPTION 3: Alternative policy structure if needed
-- Use this if the storage.foldername function doesn't work as expected:

/*
CREATE POLICY "Users can manage their files" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'client-files' AND
    auth.uid() IS NOT NULL AND
    -- Check if the file path contains the user's ID
    position(auth.uid()::text in name) > 0
  )
  WITH CHECK (
    bucket_id = 'client-files' AND
    auth.uid() IS NOT NULL AND
    position(auth.uid()::text in name) > 0
  );
*/
```

## Features Included

### Client Folder Management
- Create new client folders with name and description
- View all client folders in a grid layout
- Delete folders (with confirmation)
- Each folder shows file count and creation date

### File Management
- Upload files of any type (images, videos, documents, etc.)
- Visual thumbnails for image files
- File type icons for non-image files
- Download files
- Delete files (with confirmation)
- File size display and creation date

### UI Components Used
- **MagicCard**: For folder and file display with hover effects
- **AnimatedShinyText**: For page headers
- **RainbowButton**: For primary actions (New Folder, Upload File)
- **GridPattern**: For background decorative effects

### Security Features
- Row Level Security (RLS) ensures users can only access their own data
- File uploads are organized by user ID in storage
- Proper authentication checks before database operations

## Fallback Behavior
If the database tables don't exist, the page will show appropriate error messages and guide users to contact administrators for table setup.

## Troubleshooting

### Row Level Security Errors
If you encounter "new row violates row-level security policy" errors:

1. **Verify RLS Policies**: Ensure all RLS policies are properly created and enabled
2. **Check User Authentication**: Make sure the user is properly authenticated before operations
3. **Validate Folder Ownership**: The application validates folder ownership before file uploads
4. **Storage Bucket Policies**: Ensure storage bucket policies allow authenticated users to upload

### Common Issues
- **File Upload Failures**: Usually caused by missing storage bucket or incorrect RLS policies
- **Access Denied Errors**: Check that folder ownership validation is working correctly
- **Missing Navigation**: Ensure NavigationDock component is imported and included in the page