'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { MagicCard } from '@/components/magicui/magic-card'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'
import NavigationDock from '@/components/navigation-dock'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  Search, Twitter, Hash, Copy,
  Loader2, AlertCircle, RefreshCw, Sparkles, Target, Zap
} from 'lucide-react'

interface ViralPost {
  id: string
  content: string
  engagement_score: number
  hashtags: string[]
  style: string
  inspiration_source: string
  created_at: string
}

interface SearchMemory {
  keyword: string
  posts: ViralPost[]
  timestamp: string
}

export default function ViralTwitterPostsPage() {
  const [keyword, setKeyword] = useState('')
  const [posts, setPosts] = useState<ViralPost[]>([])
  const [loading, setLoading] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [searchMemory, setSearchMemory] = useState<SearchMemory[]>([])
  const [error, setError] = useState<string | null>(null)
  const [n8nStatus, setN8nStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [copiedPost, setCopiedPost] = useState<string | null>(null)

  useEffect(() => {
    loadSearchHistory()
    const stored = localStorage.getItem('viral-posts-memory')
    if (stored) setSearchMemory(JSON.parse(stored))
    checkN8nStatus()
  }, [])

  const checkN8nStatus = async () => {
    try {
      const response = await fetch('/api/viral-posts', { method: 'GET' })
      const data = await response.json()
      setN8nStatus(data.configuration?.connectivity === 'Connected' ? 'connected' : 'disconnected')
    } catch {
      setN8nStatus('disconnected')
    }
  }

  const loadSearchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data } = await supabase
        .from('viral_posts_history')
        .select('keyword')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (data) setSearchHistory(data.map(item => item.keyword))
    } catch (searchError) {
      setSearchHistory(['video editing', 'ai image generator', 'new ai tool', 'saas startup', 'productivity hack'])
    }
  }

  const checkMemoryForKeyword = (searchKeyword: string): ViralPost[] | null => {
    const found = searchMemory.find(m => m.keyword.toLowerCase() === searchKeyword.toLowerCase())
    return found ? found.posts : null
  }

  const handleSearch = async () => {
    if (!keyword.trim()) return
    const searchKeyword = keyword.trim()
    setLoading(true)
    setError(null)
    
    try {
      // Check memory first
      const memorizedPosts = checkMemoryForKeyword(searchKeyword)
      if (memorizedPosts?.length) {
        setPosts(memorizedPosts)
        toast.success(`Found ${memorizedPosts.length} cached viral posts`)
        setLoading(false)
        return
      }

      // Save search to history
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('viral_posts_history').insert([{ keyword: searchKeyword, user_id: user.id }])
      }

      // Call N8n API
      const response = await fetch('/api/viral-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: searchKeyword }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to generate viral posts')
      }

      const data = await response.json()
      
      if (data.success && data.posts) {
        setPosts(data.posts)
        
        // Save to memory
        const newMemory = { keyword: searchKeyword, posts: data.posts, timestamp: new Date().toISOString() }
        const updatedMemory = [newMemory, ...searchMemory.slice(0, 9)]
        setSearchMemory(updatedMemory)
        localStorage.setItem('viral-posts-memory', JSON.stringify(updatedMemory))
        
        setSearchHistory(prev => [searchKeyword, ...prev.slice(0, 4)])
        toast.success(`Generated ${data.posts.length} viral posts`)
      } else {
        setPosts([])
        toast.info('No viral posts generated for this keyword')
      }
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Search failed')
      toast.error('Failed to generate viral posts')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (content: string, postId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedPost(postId)
      toast.success('Post copied to clipboard!')
      setTimeout(() => setCopiedPost(null), 2000)
    } catch (copyError) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const getEngagementColor = (score: number) => {
    if (score >= 90) return 'bg-green-600'
    if (score >= 80) return 'bg-blue-600'
    if (score >= 70) return 'bg-yellow-600'
    return 'bg-red-600'
  }

  const getStyleIcon = (style: string) => {
    if (style.toLowerCase().includes('thread')) return <Hash className="h-4 w-4" />
    if (style.toLowerCase().includes('opinion') || style.toLowerCase().includes('contrarian')) return <Target className="h-4 w-4" />
    if (style.toLowerCase().includes('story') || style.toLowerCase().includes('pov')) return <Sparkles className="h-4 w-4" />
    return <Zap className="h-4 w-4" />
  }

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, index) => (
        <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
          <MagicCard className="p-6 rounded-lg border border-gray-700">
            <div className="space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-700 rounded w-24"></div>
                <div className="h-6 bg-gray-700 rounded-full w-12"></div>
              </div>
              <div className="h-32 bg-gray-800 rounded"></div>
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => <div key={i} className="h-5 bg-gray-700 rounded w-16"></div>)}
              </div>
              <div className="flex justify-between">
                <div className="h-8 bg-gray-700 rounded w-20"></div>
                <div className="h-8 bg-gray-700 rounded w-20"></div>
              </div>
            </div>
          </MagicCard>
        </motion.div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <AnimatedShinyText className="text-2xl font-bold mb-2">
                🐦 Viral Twitter Post Generator
              </AnimatedShinyText>
              <p className="text-muted-foreground">
                Generate engaging, viral-worthy Twitter posts using AI-powered analysis
              </p>
            </div>
            
            {/* N8n Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                n8nStatus === 'connected' ? 'bg-green-500' : 
                n8nStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm text-muted-foreground">
                N8n {n8nStatus === 'connected' ? 'Connected' : n8nStatus === 'disconnected' ? 'Offline' : 'Checking...'}
              </span>
            </div>
          </div>

          {/* Search Form */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="keyword" className="text-sm font-medium mb-2 block">
                Enter Keyword or Topic
              </Label>
              <Input
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g., video editing, ai image generator, new ai tool..."
                className="w-full"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-end">
              <RainbowButton
                onClick={handleSearch}
                disabled={loading || !keyword.trim()}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Generate Viral Posts
              </RainbowButton>
            </div>
          </div>

          {/* Recent Searches */}
          {searchHistory.length > 0 && (
            <div className="mt-4">
              <span className="text-sm text-muted-foreground mb-2 block">Recent searches:</span>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((term, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => setKeyword(term)}
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-destructive font-medium">Error generating posts</p>
            </div>
            <p className="text-destructive/80 text-sm mt-1">{error}</p>
          </div>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : posts.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Generated Posts for &ldquo;{posts[0]?.id ? keyword : 'unknown'}&rdquo;
              </h2>
              <Button
                variant="outline"
                onClick={() => handleSearch()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MagicCard className="p-6 rounded-lg border border-gray-700 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {getStyleIcon(post.style)}
                        <span className="text-sm font-medium text-muted-foreground">{post.style}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${getEngagementColor(post.engagement_score)} text-white border-0`}
                      >
                        {post.engagement_score}% viral
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="flex-1 mb-4">
                      <div className="bg-muted/30 rounded-lg p-4 border-l-4 border-blue-500">
                        <pre className="whitespace-pre-wrap text-sm font-medium leading-relaxed">
                          {post.content}
                        </pre>
                      </div>
                    </div>

                    {/* Hashtags */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {post.hashtags.slice(0, 4).map((hashtag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {hashtag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-xs text-muted-foreground">
                        Inspired by {post.inspiration_source}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(post.content, post.id)}
                          className="flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          {copiedPost === post.id ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.content)}`
                            window.open(tweetUrl, '_blank')
                          }}
                          className="flex items-center gap-1"
                        >
                          <Twitter className="h-3 w-3" />
                          Tweet
                        </Button>
                      </div>
                    </div>
                  </MagicCard>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Twitter className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Generate Viral Twitter Posts</h3>
              <p className="text-muted-foreground mb-6">
                Enter a keyword or topic and let AI create engaging, viral-worthy Twitter posts for you.
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="text-left">
                  ✨ AI-powered content creation
                </div>
                <div className="text-left">
                  🎯 High engagement optimization
                </div>
                <div className="text-left">
                  📈 Multiple viral styles
                </div>
                <div className="text-left">
                  🚀 Ready-to-post content
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <NavigationDock />
    </div>
  )
}