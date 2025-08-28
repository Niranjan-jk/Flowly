import { NextRequest, NextResponse } from 'next/server'

// N8n Configuration - Multiple URL formats to try
const N8N_BASE_URL = process.env.N8N_BASE_URL || 'https://n8n.harveyn8n.xyz'
const N8N_WEBHOOK_ID = 'viral-twitter-posts' // Specific webhook for viral posts
const N8N_API_KEY = process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzYzhlZDU5My03YjBjLTQ4NmEtYjhkZS05ODlkNGZiYTY1MDkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MDI2MDU1LCJleHAiOjE3NjAyMDc0MDB9.mRBkOgnOokKsTCq5M7JrdkQ04NCYBtOG6gzrOEF7gmc'
const ENABLE_MOCK_MODE = process.env.NODE_ENV === 'development' && process.env.N8N_MOCK_MODE === 'true'

// Multiple webhook URL formats to try
const getWebhookUrls = () => [
  `${N8N_BASE_URL}/webhook/${N8N_WEBHOOK_ID}`,
  `${N8N_BASE_URL}/webhook/viral-twitter-posts`,
  `${N8N_BASE_URL}/webhook-test/${N8N_WEBHOOK_ID}`,
  `${N8N_BASE_URL}/webhook-test/viral-twitter-posts`
]

interface ViralPost {
  id: string
  content: string
  engagement_score: number
  hashtags: string[]
  style: string
  inspiration_source: string
  created_at: string
}

// Mock data for development/fallback
const generateMockViralPosts = (keyword: string): ViralPost[] => [
  {
    id: `mock-${Date.now()}-1`,
    content: `🚀 Just discovered the GAME-CHANGING power of ${keyword}! 

Here's why everyone in 2025 needs to pay attention:

🔥 Saves 10+ hours per week
💡 Increases productivity by 300%
✨ Makes complex tasks feel effortless

The future is NOW, and ${keyword} is leading the charge!

Who else is ready to level up? 👇

#${keyword.replace(/\s+/g, '')} #ProductivityHack #GameChanger #TechTrends`,
    engagement_score: 92,
    hashtags: ['#ProductivityHack', '#GameChanger', '#TechTrends', `#${keyword.replace(/\s+/g, '')}`],
    style: 'Enthusiastic Thread',
    inspiration_source: 'Viral productivity posts',
    created_at: new Date().toISOString()
  },
  {
    id: `mock-${Date.now()}-2`,
    content: `UNPOPULAR OPINION: 

${keyword} isn't just a trend—it's the blueprint for success in 2025 🎯

While everyone is sleeping on this:
• Industry leaders are quietly building empires
• Smart professionals are 10x-ing their results  
• Early adopters are securing their competitive advantage

The question isn't IF you'll use ${keyword}...

It's WHEN you'll stop making excuses and start winning 💪

Are you ready to join the 1%? 🔥`,
    engagement_score: 87,
    hashtags: ['#Success', '#Mindset', '#Leadership', `#${keyword.replace(/\s+/g, '')}`],
    style: 'Contrarian Opinion',
    inspiration_source: 'Motivational business content',
    created_at: new Date().toISOString()
  },
  {
    id: `mock-${Date.now()}-3`,
    content: `POV: You just learned about ${keyword} and everything clicked 💡

That moment when you realize:

✅ This solves ALL your problems
✅ You've been doing it the hard way
✅ Success was always this simple
✅ You wish you started sooner

The best time to plant a tree was 20 years ago.
The second best time is NOW 🌱

Ready to transform your life with ${keyword}?

Drop a 🔥 if you're starting TODAY!`,
    engagement_score: 89,
    hashtags: ['#Transformation', '#Growth', '#Motivation', `#${keyword.replace(/\s+/g, '')}`],
    style: 'POV Storytelling',
    inspiration_source: 'Personal development viral posts',
    created_at: new Date().toISOString()
  }
]

// Test connectivity to N8n instance
async function testConnectivity(baseUrl: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    await fetch(baseUrl, { 
      method: 'GET',
      signal: controller.signal,
      headers: { 'User-Agent': 'Flowly-CRM-Viral-Posts-Check' }
    })
    
    clearTimeout(timeoutId)
    return true // Any response means the domain is reachable
  } catch (error) {
    console.log(`Connectivity test failed for ${baseUrl}:`, error instanceof Error ? error.message : 'Unknown error')
    return false
  }
}

// Try webhook URLs in sequence
async function callN8nWebhook(keyword: string): Promise<unknown> {
  const webhookUrls = getWebhookUrls()
  const errors: string[] = []
  
  for (let i = 0; i < webhookUrls.length; i++) {
    const webhookUrl = webhookUrls[i]
    try {
      console.log(`Trying webhook URL ${i + 1}/${webhookUrls.length}: ${webhookUrl}`)
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${N8N_API_KEY}`,
        },
        body: JSON.stringify({
          keyword: keyword.trim(),
          timestamp: new Date().toISOString(),
          source: 'flowly-viral-posts',
          request_count: 3, // Request 3 viral posts
          styles: ['thread', 'opinion', 'story'] // Different viral post styles
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      console.log(`✅ Webhook call successful with URL: ${webhookUrl}`)
      return data
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      errors.push(`URL ${i + 1} (${webhookUrl}): ${errorMsg}`)
      console.log(`❌ Webhook URL ${i + 1} failed:`, errorMsg)
    }
  }
  
  // All URLs failed
  throw new Error(`All webhook URLs failed:\n${errors.join('\n')}`)
}

export async function POST(request: NextRequest) {
  try {
    const { keyword } = await request.json()

    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json(
        { error: 'Invalid keyword provided' },
        { status: 400 }
      )
    }

    const searchKeyword = keyword.trim()
    console.log(`🐦 Starting viral post generation for keyword: "${searchKeyword}"`)

    // Check if mock mode is enabled
    if (ENABLE_MOCK_MODE) {
      console.log('📋 Mock mode enabled - returning sample viral posts')
      const mockData = generateMockViralPosts(searchKeyword)
      
      return NextResponse.json({
        success: true,
        posts: mockData,
        keyword: searchKeyword,
        total: mockData.length,
        mode: 'mock'
      })
    }

    // Test connectivity first
    console.log('🌐 Testing N8n connectivity...')
    const isConnected = await testConnectivity(N8N_BASE_URL)
    
    if (!isConnected) {
      console.log('⚠️ N8n instance not reachable, falling back to mock data')
      const mockData = generateMockViralPosts(searchKeyword)
      
      return NextResponse.json({
        success: true,
        posts: mockData,
        keyword: searchKeyword,
        total: mockData.length,
        mode: 'fallback',
        warning: 'N8n instance not reachable. Using fallback data for development.'
      })
    }

    // Call N8n webhook with retry logic
    console.log('📡 Calling N8n webhook...')
    const data = await callN8nWebhook(searchKeyword)

    // Validate and transform the response data to match our ViralPost interface
    const transformedPosts = Array.isArray(data) ? data.map((item: unknown, index: number) => {
      const post = item as Record<string, unknown>
      return {
        id: post.id || `viral-${Date.now()}-${index}`,
        content: post.content || post.text || '',
        engagement_score: typeof post.engagement_score === 'number' ? post.engagement_score : 
                         typeof post.score === 'number' ? post.score : 
                         Math.floor(Math.random() * 30) + 70,
        hashtags: Array.isArray(post.hashtags) ? post.hashtags as string[] : [`#${searchKeyword.replace(/\s+/g, '')}`],
        style: post.style || 'Generated Post',
        inspiration_source: post.inspiration_source || 'N8n Viral Analysis',
        created_at: post.created_at || new Date().toISOString()
      }
    }) : []

    console.log(`✅ Successfully processed ${transformedPosts.length} viral posts`)

    return NextResponse.json({
      success: true,
      posts: transformedPosts,
      keyword: searchKeyword,
      total: transformedPosts.length,
      mode: 'production'
    })

  } catch (error) {
    console.error('❌ N8n API Error:', error)
    
    // Provide fallback data even on error
    let fallbackKeyword = 'error-fallback'
    try {
      const { keyword } = await request.json()
      fallbackKeyword = keyword?.trim() || 'error-fallback'
    } catch {
      // If we can't parse the request again, use fallback
    }
    
    console.log('🔄 Providing fallback data due to error')
    const mockData = generateMockViralPosts(fallbackKeyword)
    
    return NextResponse.json({
      success: true,
      posts: mockData,
      keyword: fallbackKeyword,
      total: mockData.length,
      mode: 'error-fallback',
      warning: 'N8n webhook failed. Using fallback data. Check server logs for details.',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function GET() {
  const webhookUrls = getWebhookUrls()
  const connectivity = await testConnectivity(N8N_BASE_URL)
  
  return NextResponse.json({
    message: 'Viral Twitter Posts API endpoint',
    methods: ['POST'],
    description: 'Send POST request with { keyword: string } to generate viral Twitter posts',
    configuration: {
      baseUrl: N8N_BASE_URL,
      webhookId: N8N_WEBHOOK_ID,
      mockMode: ENABLE_MOCK_MODE,
      connectivity: connectivity ? 'Connected' : 'Not reachable'
    },
    webhookUrls,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      mockMode: process.env.N8N_MOCK_MODE
    },
    sampleRequest: {
      keyword: "ai image generator"
    }
  })
}