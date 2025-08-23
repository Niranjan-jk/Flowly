'use client'

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EmailTemplate {
  id?: string;
  title: string;
  description: string;
  category: string;
  subject: string;
  content: string;
  preview: string;
}

interface ModernTemplateFormProps {
  template?: EmailTemplate | null;
  onSave: (templateData: Partial<EmailTemplate>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ModernTemplateForm({ 
  template, 
  onSave, 
  onCancel, 
  loading = false 
}: ModernTemplateFormProps) {
  const [formData, setFormData] = useState({
    title: template?.title || '',
    description: template?.description || '',
    category: template?.category || 'Marketing',
    subject: template?.subject || '',
    content: template?.content || '',
    preview: template?.preview || ''
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const categories = [
    'Marketing',
    'Sales',
    'Onboarding',
    'Support',
    'Newsletter',
    'Follow-up',
    'Proposal',
    'Welcome',
    'Other'
  ];

  return (
    <div className="shadow-input mx-auto w-full max-w-2xl rounded-2xl bg-white p-8 dark:bg-black border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
        {template ? 'Edit Email Template' : 'Create New Email Template'}
      </h2>
      <p className="mt-2 max-w-lg text-sm text-neutral-600 dark:text-neutral-300">
        {template 
          ? 'Update your email template with new content and settings.' 
          : 'Create a professional email template for your outreach campaigns.'
        }
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
            Template Information
          </h3>
          
          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="title">Template Title *</Label>
              <Input 
                id="title" 
                placeholder="Welcome Email" 
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                required
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateFormData('category', value)}
              >
                <SelectTrigger className="w-full h-10 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-zinc-800 text-black dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </LabelInputContainer>
          </div>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="description">Description</Label>
            <Input 
              id="description" 
              placeholder="Brief description of this email template" 
              type="text"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
            />
          </LabelInputContainer>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="preview">Preview Text</Label>
            <Input 
              id="preview" 
              placeholder="Short preview text that appears in email lists..." 
              type="text"
              value={formData.preview}
              onChange={(e) => updateFormData('preview', e.target.value)}
            />
          </LabelInputContainer>
        </div>

        {/* Email Content Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
            Email Content
          </h3>
          
          <LabelInputContainer className="mb-4">
            <Label htmlFor="subject">Subject Line *</Label>
            <Input 
              id="subject" 
              placeholder="Welcome to [Company Name]!" 
              type="text"
              value={formData.subject}
              onChange={(e) => updateFormData('subject', e.target.value)}
              required
            />
          </LabelInputContainer>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="content">Email Content *</Label>
            <textarea
              id="content"
              placeholder="Write your email content here... You can use [Name], [Company], and other placeholders."
              value={formData.content}
              onChange={(e) => updateFormData('content', e.target.value)}
              required
              rows={8}
              className={cn(
                "flex h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white",
                "min-h-[100px] resize-y"
              )}
            />
          </LabelInputContainer>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <button
            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
            type="submit"
            disabled={loading || !formData.title.trim() || !formData.subject.trim() || !formData.content.trim()}
          >
            {loading ? 'Saving...' : (template ? 'Update Template' : 'Create Template')} &rarr;
            <BottomGradient />
          </button>

          <button
            className="group/btn shadow-input relative flex h-10 w-full items-center justify-center rounded-md bg-gray-50 font-medium text-black dark:bg-zinc-900 dark:text-white dark:shadow-[0px_0px_1px_1px_#262626]"
            type="button"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
            <BottomGradient />
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
          <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-2">
            Available Placeholders:
          </h4>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
            <p><code>[Name]</code> - Client's name</p>
            <p><code>[Company]</code> - Client's company</p>
            <p><code>[Email]</code> - Client's email address</p>
            <p><code>[Channel]</code> - Client's channel name</p>
          </div>
        </div>
      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};