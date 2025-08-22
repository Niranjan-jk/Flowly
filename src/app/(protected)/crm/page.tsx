'use client'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { CRMDataTable, CRMClient } from '@/components/crm-data-table'
import { ClientDialog } from '@/components/client-dialog'
import NavigationDock from '@/components/navigation-dock'
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'
import { toast } from 'sonner'

export default function CRMPage() {
  const [clients, setClients] = useState<CRMClient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<CRMClient | null>(null)
  const [saveLoading, setSaveLoading] = useState(false)

  async function loadClients() {
    setLoading(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data, error } = await supabase
        .from('crm_clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        setError(error.message)
      } else {
        // Transform data to match CRMClient interface
        const transformedData: CRMClient[] = (data || []).map(item => ({
          id: item.id,
          channel_name: item.channel_name || '',
          subscribers: item.subscribers || 0,
          email: item.email,
          status: item.status || 'Started',
          budget_score: item.budget_score || 0,
          created_at: item.created_at,
          social_links: item.social_links || {
            youtube: '',
            instagram: '',
            twitter: '',
            tiktok: ''
          },
          client_details: item.client_details || {
            name: item.channel_name || '',
            company: '',
            phone: '',
            notes: ''
          }
        }))
        setClients(transformedData)
      }
    } catch (err) {
      setError('Failed to load clients')
      console.error('Error loading clients:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  const handleAddClient = () => {
    setEditingClient(null)
    setDialogOpen(true)
  }

  const handleEditClient = (client: CRMClient) => {
    setEditingClient(client)
    setDialogOpen(true)
  }

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return
    
    try {
      const { error } = await supabase
        .from('crm_clients')
        .delete()
        .eq('id', id)
      
      if (error) {
        toast.error('Failed to delete client')
      } else {
        toast.success('Client deleted successfully')
        loadClients()
      }
    } catch (err) {
      toast.error('Failed to delete client')
      console.error('Error deleting client:', err)
    }
  }

  const handleSaveClient = async (clientData: Partial<CRMClient>) => {
    setSaveLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('User not authenticated')
        return
      }

      const dataToSave = {
        user_id: user.id,
        channel_name: clientData.channel_name,
        subscribers: clientData.subscribers || 0,
        email: clientData.email || null,
        status: clientData.status || 'Started',
        budget_score: clientData.budget_score || 0,
        social_links: clientData.social_links || {
          youtube: '',
          instagram: '',
          twitter: '',
          tiktok: ''
        },
        client_details: clientData.client_details || {
          name: clientData.channel_name || '',
          company: '',
          phone: '',
          notes: ''
        }
      }

      let error
      
      if (editingClient) {
        // Update existing client
        const result = await supabase
          .from('crm_clients')
          .update(dataToSave)
          .eq('id', editingClient.id)
        error = result.error
      } else {
        // Create new client
        const result = await supabase
          .from('crm_clients')
          .insert([dataToSave])
        error = result.error
      }
      
      if (error) {
        toast.error(`Failed to ${editingClient ? 'update' : 'create'} client`)
        console.error('Error saving client:', error)
      } else {
        toast.success(`Client ${editingClient ? 'updated' : 'created'} successfully`)
        loadClients()
        setDialogOpen(false)
        setEditingClient(null)
      }
    } catch (err) {
      toast.error('Failed to save client')
      console.error('Error saving client:', err)
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <AnimatedShinyText className="text-3xl font-bold">
                CRM Management
              </AnimatedShinyText>
              <p className="text-gray-400 mt-1">
                Manage your client relationships and track outreach progress
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}
        
        <CRMDataTable
          data={clients}
          onEdit={handleEditClient}
          onDelete={handleDeleteClient}
          onAddClient={handleAddClient}
          loading={loading}
        />
      </div>
      
      {/* Client Dialog */}
      <ClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={editingClient}
        onSave={handleSaveClient}
        loading={saveLoading}
      />
      
      {/* Navigation Dock */}
      <NavigationDock />
    </div>
  )
}
