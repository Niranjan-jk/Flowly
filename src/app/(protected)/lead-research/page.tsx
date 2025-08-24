'use client'
'use client'

import React, { useState, useEffect, useId, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { MagicCard } from '@/components/magicui/magic-card'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'
import NavigationDock from '@/components/navigation-dock'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useOutsideClick } from '@/hooks/use-outside-click'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  Search, Building2, Mail, Phone, Globe, MapPin, Users, DollarSign,
  Calendar, ExternalLink, RefreshCw, ChevronLeft, ChevronRight,
  Loader2, AlertCircle
} from 'lucide-react'

interface LeadResult {
  id: string; company_name: string; contact_person: string; email: string;
  phone: string; website: string; industry: string; location: string;
  company_size: string; revenue: string; description: string;
  keywords: string[]; score: number; last_updated: string; source: string;
}

interface SearchMemory {
  keyword: string; results: LeadResult[]; timestamp: string;
}

const RESULTS_PER_PAGE = 20

export default function LeadResearchPage() {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<LeadResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [searchMemory, setSearchMemory] = useState<SearchMemory[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [active, setActive] = useState<LeadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const id = useId()
  const ref = useRef<HTMLDivElement>(null)

  const totalPages = Math.ceil(results.length / RESULTS_PER_PAGE)
  const startIndex = (currentPage - 1) * RESULTS_PER_PAGE
  const currentResults = results.slice(startIndex, startIndex + RESULTS_PER_PAGE)

  useEffect(() => {
    loadSearchHistory()
    const stored = localStorage.getItem('lead-research-memory')
    if (stored) setSearchMemory(JSON.parse(stored))
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setActive(null)
    }
    if (active) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'auto'
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active])

  useOutsideClick(ref as React.RefObject<HTMLDivElement>, () => setActive(null))

  const loadSearchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('search_history')
        .select('keyword')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      if (data) setSearchHistory(data.map(item => item.keyword))
    } catch (error) {
      setSearchHistory(['SaaS startups', 'E-commerce companies', 'FinTech'])
    }
  }

  const checkMemoryForKeyword = (searchKeyword: string): LeadResult[] | null => {
    const found = searchMemory.find(m => m.keyword.toLowerCase() === searchKeyword.toLowerCase())
    return found ? found.results : null
  }

  const handleSearch = async () => {
    if (!keyword.trim()) return
    const searchKeyword = keyword.trim()
    setLoading(true)
    setError(null)
    setCurrentPage(1)
    
    try {
      // Check memory first
      const memorizedResults = checkMemoryForKeyword(searchKeyword)
      if (memorizedResults?.length) {
        setResults(memorizedResults)
        toast.success(`Found ${memorizedResults.length} cached results`)
        setLoading(false)
        return
      }

      // Save search to history
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('search_history').insert([{ keyword: searchKeyword, user_id: user.id }])
      }

      // Call N8n API
      const response = await fetch('/api/lead-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: searchKeyword }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch leads')
      }

      const data = await response.json()
      
      if (data.success && data.results) {
        setResults(data.results)
        
        // Save to memory
        const newMemory = { keyword: searchKeyword, results: data.results, timestamp: new Date().toISOString() }
        const updatedMemory = [newMemory, ...searchMemory.slice(0, 9)]
        setSearchMemory(updatedMemory)
        localStorage.setItem('lead-research-memory', JSON.stringify(updatedMemory))
        
        setSearchHistory(prev => [searchKeyword, ...prev.slice(0, 4)])
        toast.success(`Found ${data.results.length} new leads`)
      } else {
        setResults([])
        toast.info('No leads found for this keyword')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Search failed')
      toast.error('Failed to search for leads')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-600'
    if (score >= 60) return 'bg-yellow-600'
    return 'bg-red-600'
  }

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
          <MagicCard className="p-6 rounded-lg border border-gray-700">
            <div className="space-y-4 animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-5 bg-gray-700 rounded w-32"></div>
                  <div className="h-4 bg-gray-800 rounded w-24"></div>
                </div>
                <div className="h-6 bg-gray-700 rounded-full w-12"></div>
              </div>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <div key={i} className="flex gap-2"><div className="h-4 w-4 bg-gray-700 rounded"></div><div className="h-4 bg-gray-800 rounded flex-1"></div></div>)}
              </div>
              <div className="h-16 bg-gray-800 rounded"></div>
            </div>
          </MagicCard>
        </motion.div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen pb-20">
      {/* Expanded View Modal */}
      <AnimatePresence>
        {active && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50" />
            <div className="fixed inset-0 grid place-items-center z-[100]">
              <motion.div
                layoutId={`card-${active.id}-${id}`}
                ref={ref}
                className="w-full max-w-[600px] max-h-[90%] bg-gray-900 sm:rounded-3xl overflow-auto border border-gray-700"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-bold text-white text-2xl">{active.company_name}</h3>
                      <p className="text-gray-400 text-lg">{active.contact_person}</p>
                    </div>
                    <Badge className={`${getScoreColor(active.score)} text-white`}>{active.score}%</Badge>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-300"><Building2 className="h-5 w-5" /><span>{active.industry}</span></div>
                        <div className="flex items-center gap-3 text-gray-300"><MapPin className="h-5 w-5" /><span>{active.location}</span></div>
                        <div className="flex items-center gap-3 text-gray-300"><Users className="h-5 w-5" /><span>{active.company_size} employees</span></div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-300"><DollarSign className="h-5 w-5" /><span>{active.revenue}</span></div>
                        <div className="flex items-center gap-3 text-gray-300"><Mail className="h-5 w-5" /><a href={`mailto:${active.email}`} className="hover:text-white">{active.email}</a></div>
                        {active.website && <div className="flex items-center gap-3 text-gray-300"><Globe className="h-5 w-5" /><a href={active.website} target="_blank" className="hover:text-white flex items-center gap-2">Website <ExternalLink className="h-4 w-4" /></a></div>}
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-700 pt-6">
                      <h4 className="text-white font-semibold mb-4">Description</h4>
                      <p className="text-gray-300">{active.description}</p>
                    </div>
                    
                    <div className="border-t border-gray-700 pt-6">
                      <h4 className="text-white font-semibold mb-4">Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {active.keywords.map((keyword, index) => <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-300">{keyword}</Badge>)}
                      </div>
                    </div>
                  </div>
                  
                  <button onClick={() => setActive(null)} className="mt-6 w-full py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">Close</button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="border-b border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AnimatedShinyText className="text-3xl font-bold">Lead Research</AnimatedShinyText>
          <p className="text-gray-400 mt-1">Discover potential leads using automated research powered by N8N</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8 p-6 rounded-lg border border-gray-700">
          <Label className="text-white text-lg font-medium">Research Keywords</Label>
          <p className="text-gray-400 text-sm mt-1 mb-4">Enter keywords to search for leads via N8N workflow</p>
          
          <div className="flex gap-4 mb-4">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., SaaS startups, E-commerce companies..."
              className="bg-gray-700 border-gray-600 text-white h-12 text-lg flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <RainbowButton onClick={handleSearch} disabled={loading || !keyword.trim()} className="h-12 px-8">
              {loading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Search className="h-5 w-5 mr-2" />}
              {loading ? 'Searching...' : 'Research'}
            </RainbowButton>
          </div>

          {searchHistory.length > 0 && (
            <div className="space-y-2">
              <Label className="text-white text-sm">Recent:</Label>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((term, index) => (
                  <button key={index} onClick={() => setKeyword(term)} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600">{term}</button>
                ))}
              </div>
            </div>
          )}

          {searchMemory.length > 0 && (
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-700 mt-4">
              💾 {searchMemory.length} searches cached
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-center gap-2 text-red-300">
            <AlertCircle className="h-5 w-5" /><span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="space-y-6">
            <div className="text-center"><h2 className="text-2xl font-bold text-white mb-2">Researching leads...</h2><p className="text-gray-400">Processing via N8N workflow</p></div>
            <LoadingSkeleton />
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Results ({results.length})</h2>
              {totalPages > 1 && <div className="text-gray-400">Page {currentPage} of {totalPages}</div>}
            </div>

            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentResults.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  layoutId={`card-${lead.id}-${id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActive(lead)}
                  className="cursor-pointer"
                >
                  <MagicCard className="p-6 hover:scale-105 transition-transform duration-200 rounded-lg border border-gray-700">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{lead.company_name}</h3>
                          <p className="text-gray-400 text-sm">{lead.contact_person}</p>
                        </div>
                        <Badge className={`${getScoreColor(lead.score)} text-white`}>{lead.score}%</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-300 text-sm"><Building2 className="h-4 w-4" /><span>{lead.industry}</span></div>
                        <div className="flex items-center gap-2 text-gray-300 text-sm"><MapPin className="h-4 w-4" /><span>{lead.location}</span></div>
                        <div className="flex items-center gap-2 text-gray-300 text-sm"><Users className="h-4 w-4" /><span>{lead.company_size}</span></div>
                      </div>
                      
                      <p className="text-gray-400 text-sm line-clamp-2">{lead.description}</p>
                      
                      <div className="flex flex-wrap gap-1">
                        {lead.keywords.slice(0, 3).map((keyword, index) => <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-300 text-xs">{keyword}</Badge>)}
                        {lead.keywords.length > 3 && <Badge variant="secondary" className="bg-gray-700 text-gray-300 text-xs">+{lead.keywords.length - 3}</Badge>}
                      </div>
                    </div>
                  </MagicCard>
                </motion.div>
              ))}
            </motion.div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-4 mt-8">
                <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} variant="outline" className="border-gray-600">
                  <ChevronLeft className="h-4 w-4 mr-2" />Previous
                </Button>
                <Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} variant="outline" className="border-gray-600">
                  Next<ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}

        {!loading && results.length === 0 && keyword && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <MagicCard className="p-12 max-w-md mx-auto rounded-lg border border-gray-700">
              <AlertCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No qualified leads found</h3>
              <p className="text-gray-400 mb-6">Try another keyword</p>
              <Button onClick={() => setKeyword('')} variant="outline" className="border-gray-600">Clear Search</Button>
            </MagicCard>
          </motion.div>
        )}

        {!loading && results.length === 0 && !keyword && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Ready to Research</h3>
            <p className="text-gray-400">Enter keywords to start researching leads</p>
          </div>
        )}
      </div>

      <NavigationDock />
    </div>
  )
}