'use client'

import React, { useState, useEffect } from "react";
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
import { CRMClient } from "./crm-data-table";

interface ModernClientFormProps {
  client?: CRMClient | null;
  onSave: (clientData: Partial<CRMClient>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ModernClientForm({ 
  client, 
  onSave, 
  onCancel, 
  loading = false 
}: ModernClientFormProps) {
  const [formData, setFormData] = useState({
    channel_name: '',
    subscribers: 0,
    email: '',
    status: 'Started' as 'Started' | 'Idle' | 'Closed',
    client_details: {
      name: '',
      company: '',
      phone: '',
      notes: ''
    },
    social_links: {
      youtube: '',
      instagram: '',
      twitter: '',
      tiktok: ''
    },
    budget_score: 0
  });

  useEffect(() => {
    if (client) {
      setFormData({
        channel_name: client.channel_name || '',
        subscribers: client.subscribers || 0,
        email: client.email || '',
        status: client.status || 'Started',
        client_details: {
          name: client.client_details?.name || '',
          company: client.client_details?.company || '',
          phone: client.client_details?.phone || '',
          notes: client.client_details?.notes || ''
        },
        social_links: {
          youtube: client.social_links?.youtube || '',
          instagram: client.social_links?.instagram || '',
          twitter: client.social_links?.twitter || '',
          tiktok: client.social_links?.tiktok || ''
        },
        budget_score: client.budget_score || 0
      });
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedFormData = (parent: string, field: string, value: any) => {
    setFormData(prev => {
      const parentObj = prev[parent as keyof typeof prev] as Record<string, any>;
      return {
        ...prev,
        [parent]: {
          ...parentObj,
          [field]: value
        }
      };
    });
  };

  return (
    <div className="shadow-input mx-auto w-full max-w-2xl rounded-2xl bg-white p-8 dark:bg-black border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
        {client ? 'Edit Client' : 'Add New Client'}
      </h2>
      <p className="mt-2 max-w-lg text-sm text-neutral-600 dark:text-neutral-300">
        {client 
          ? 'Update the client information in your CRM database.' 
          : 'Add a new client to your CRM system with all relevant details.'
        }
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
            Basic Information
          </h3>
          
          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="channel_name">Channel Name *</Label>
              <Input 
                id="channel_name" 
                placeholder="Enter channel name" 
                type="text"
                value={formData.channel_name}
                onChange={(e) => updateFormData('channel_name', e.target.value)}
                required
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="subscribers">Subscribers</Label>
              <Input 
                id="subscribers" 
                placeholder="0" 
                type="number"
                value={formData.subscribers}
                onChange={(e) => updateFormData('subscribers', parseInt(e.target.value) || 0)}
              />
            </LabelInputContainer>
          </div>

          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                placeholder="client@example.com" 
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="budget_score">Budget Score (0-100)</Label>
              <Input 
                id="budget_score" 
                placeholder="50" 
                type="number"
                min="0"
                max="100"
                value={formData.budget_score}
                onChange={(e) => updateFormData('budget_score', parseInt(e.target.value) || 0)}
              />
            </LabelInputContainer>
          </div>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => updateFormData('status', value)}
            >
              <SelectTrigger className="w-full h-10 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-zinc-800 text-black dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Started">Started</SelectItem>
                <SelectItem value="Idle">Idle</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </LabelInputContainer>
        </div>

        {/* Client Details Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
            Client Details
          </h3>
          
          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="client_name">Client Name</Label>
              <Input 
                id="client_name" 
                placeholder="John Doe" 
                type="text"
                value={formData.client_details.name}
                onChange={(e) => updateNestedFormData('client_details', 'name', e.target.value)}
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="company">Company</Label>
              <Input 
                id="company" 
                placeholder="Company Inc." 
                type="text"
                value={formData.client_details.company}
                onChange={(e) => updateNestedFormData('client_details', 'company', e.target.value)}
              />
            </LabelInputContainer>
          </div>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              placeholder="+1 (555) 123-4567" 
              type="tel"
              value={formData.client_details.phone}
              onChange={(e) => updateNestedFormData('client_details', 'phone', e.target.value)}
            />
          </LabelInputContainer>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="notes">Notes</Label>
            <Input 
              id="notes" 
              placeholder="Additional notes about this client..." 
              type="text"
              value={formData.client_details.notes}
              onChange={(e) => updateNestedFormData('client_details', 'notes', e.target.value)}
            />
          </LabelInputContainer>
        </div>

        {/* Social Links Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
            Social Media Links
          </h3>
          
          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="youtube">YouTube Channel</Label>
              <Input 
                id="youtube" 
                placeholder="https://youtube.com/@channel" 
                type="url"
                value={formData.social_links.youtube}
                onChange={(e) => updateNestedFormData('social_links', 'youtube', e.target.value)}
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="instagram">Instagram Profile</Label>
              <Input 
                id="instagram" 
                placeholder="https://instagram.com/username" 
                type="url"
                value={formData.social_links.instagram}
                onChange={(e) => updateNestedFormData('social_links', 'instagram', e.target.value)}
              />
            </LabelInputContainer>
          </div>

          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="twitter">Twitter/X Profile</Label>
              <Input 
                id="twitter" 
                placeholder="https://twitter.com/username" 
                type="url"
                value={formData.social_links.twitter}
                onChange={(e) => updateNestedFormData('social_links', 'twitter', e.target.value)}
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="tiktok">TikTok Profile</Label>
              <Input 
                id="tiktok" 
                placeholder="https://tiktok.com/@username" 
                type="url"
                value={formData.social_links.tiktok}
                onChange={(e) => updateNestedFormData('social_links', 'tiktok', e.target.value)}
              />
            </LabelInputContainer>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <button
            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
            type="submit"
            disabled={loading || !formData.channel_name.trim()}
          >
            {loading ? 'Saving...' : (client ? 'Update Client' : 'Add Client')} &rarr;
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