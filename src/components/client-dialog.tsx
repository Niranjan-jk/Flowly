'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CRMClient } from "./crm-data-table"

interface ClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: CRMClient | null
  onSave: (clientData: Partial<CRMClient>) => Promise<void>
  loading?: boolean
}

export function ClientDialog({ 
  open, 
  onOpenChange, 
  client, 
  onSave, 
  loading = false 
}: ClientDialogProps) {
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
  })

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
      })
    } else {
      // Reset form for new client
      setFormData({
        channel_name: '',
        subscribers: 0,
        email: '',
        status: 'Started',
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
      })
    }
  }, [client, open])

  const handleSave = async () => {
    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving client:', error)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateNestedFormData = (parent: string, field: string, value: any) => {
    setFormData(prev => {
      const parentObj = prev[parent as keyof typeof prev] as Record<string, any>
      return {
        ...prev,
        [parent]: {
          ...parentObj,
          [field]: value
        }
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {client ? 'Edit Client' : 'Add New Client'}
          </DialogTitle>
          <DialogDescription>
            {client 
              ? 'Update the client information below.' 
              : 'Fill in the details to add a new client to your CRM.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Basic Information</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="channel_name">Channel Name *</Label>
                <Input
                  id="channel_name"
                  value={formData.channel_name}
                  onChange={(e) => updateFormData('channel_name', e.target.value)}
                  placeholder="Enter channel name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subscribers">Subscribers</Label>
                <Input
                  id="subscribers"
                  type="number"
                  value={formData.subscribers}
                  onChange={(e) => updateFormData('subscribers', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="client@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => updateFormData('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Started">Started</SelectItem>
                    <SelectItem value="Idle">Idle</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget_score">Budget Score (0-100)</Label>
              <Input
                id="budget_score"
                type="number"
                min="0"
                max="100"
                value={formData.budget_score}
                onChange={(e) => updateFormData('budget_score', parseInt(e.target.value) || 0)}
                placeholder="50"
              />
            </div>
          </div>

          {/* Client Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Client Details</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name</Label>
                <Input
                  id="client_name"
                  value={formData.client_details.name}
                  onChange={(e) => updateNestedFormData('client_details', 'name', e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.client_details.company}
                  onChange={(e) => updateNestedFormData('client_details', 'company', e.target.value)}
                  placeholder="Company Inc."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.client_details.phone}
                onChange={(e) => updateNestedFormData('client_details', 'phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.client_details.notes}
                onChange={(e) => updateNestedFormData('client_details', 'notes', e.target.value)}
                placeholder="Additional notes..."
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Social Links</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  value={formData.social_links.youtube}
                  onChange={(e) => updateNestedFormData('social_links', 'youtube', e.target.value)}
                  placeholder="https://youtube.com/@channel"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.social_links.instagram}
                  onChange={(e) => updateNestedFormData('social_links', 'instagram', e.target.value)}
                  placeholder="https://instagram.com/username"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter/X</Label>
                <Input
                  id="twitter"
                  value={formData.social_links.twitter}
                  onChange={(e) => updateNestedFormData('social_links', 'twitter', e.target.value)}
                  placeholder="https://twitter.com/username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tiktok">TikTok</Label>
                <Input
                  id="tiktok"
                  value={formData.social_links.tiktok}
                  onChange={(e) => updateNestedFormData('social_links', 'tiktok', e.target.value)}
                  placeholder="https://tiktok.com/@username"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading || !formData.channel_name.trim()}
          >
            {loading ? 'Saving...' : (client ? 'Update Client' : 'Add Client')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}