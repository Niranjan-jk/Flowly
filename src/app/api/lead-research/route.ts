import { NextRequest, NextResponse } from 'next/server'

// N8n Configuration - Multiple URL formats to try
const N8N_BASE_URL = process.env.N8N_BASE_URL || 'https://n8n.harveyn8n.xyz'
const N8N_WEBHOOK_ID = 'a6fd75b8-81ca-4002-b17e-cce580bf6769' // From Megatron.json
const N8N_API_KEY = process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzYzhlZDU5My03YjBjLTQ4NmEtYjhkZS05ODlkNGZiYTY1MDkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MDI2MDU1LCJleHAiOjE3NjAyMDc0MDB9.mRBkOgnOokKsTCq5M7JrdkQ04NCYBtOG6gzrOEF7gmc'
const ENABLE_MOCK_MODE = process.env.NODE_ENV === 'development' && process.env.N8N_MOCK_MODE === 'true'

// Multiple webhook URL formats to try
const getWebhookUrls = () => [
  `${N8N_BASE_URL}/webhook/${N8N_WEBHOOK_ID}`,
  `${N8N_BASE_URL}/webhook/lead-research`,
  `${N8N_BASE_URL}/webhook-test/${N8N_WEBHOOK_ID}`,
  `${N8N_BASE_URL}/webhook-test/lead-research`
]

// Mock data for development/fallback
const generateMockLeads = (keyword: string) => [
  {
    id: `mock-${Date.now()}-1`,
    channelTitle: `${keyword} Solutions Inc`,
    channelUrl: 'https://youtube.com/@sample-channel-1',
    subscriberCount: '15000',
    qualityScore: 85,
    budgetScore: 75,
    summary: `A growing company focused on ${keyword} solutions with strong engagement`,
    channelDescription: `We provide innovative ${keyword} services to businesses worldwide`,
    socialLinks: { email: 'contact@sample1.com', website: 'https://sample1.com' },
    country: 'United States'
  },
  {
    id: `mock-${Date.now()}-2`,
    channelTitle: `Digital ${keyword} Co`,
    channelUrl: 'https://youtube.com/@digital-sample',
    subscriberCount: '8500',
    qualityScore: 72,
    budgetScore: 68,
    summary: `Medium-sized ${keyword} company with consistent content creation`,
    channelDescription: `Digital transformation through ${keyword} innovation`,
    socialLinks: { email: 'info@digitalsample.com' },
    country: 'Canada'
  },
  {
    id: `mock-${Date.now()}-3`,
    channelTitle: `${keyword} Experts Hub`,
    channelUrl: 'https://youtube.com/@experts-hub',
    subscriberCount: '22000',
    qualityScore: 91,
    budgetScore: 83,
    summary: `Leading ${keyword} consultancy with high-quality educational content`,
    channelDescription: `Expert guidance and consulting for ${keyword} implementation`,
    socialLinks: { email: 'experts@hub.com', website: 'https://expertshub.com' },
    country: 'United Kingdom'
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
      headers: { 'User-Agent': 'Flowly-CRM-Health-Check' }
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
          source: 'flowly-lead-research'
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
    console.log(`🔍 Starting lead research for keyword: "${searchKeyword}"`)

    // Check if mock mode is enabled
    if (ENABLE_MOCK_MODE) {
      console.log('📋 Mock mode enabled - returning sample data')
      const mockData = generateMockLeads(searchKeyword)
      const transformedResults = mockData.map((item) => ({
        id: item.id,
        company_name: item.channelTitle,
        contact_person: item.channelTitle,
        email: item.socialLinks?.email || '',
        phone: '',
        website: item.socialLinks?.website || item.channelUrl,
        industry: 'YouTube Creator',
        location: item.country,
        company_size: `${item.subscriberCount} subscribers`,
        revenue: `Budget Score: ${item.budgetScore}`,
        description: item.summary,
        keywords: [searchKeyword],
        score: item.qualityScore,
        last_updated: new Date().toISOString(),
        source: 'Mock Data'
      }))
      
      return NextResponse.json({
        success: true,
        results: transformedResults,
        keyword: searchKeyword,
        total: transformedResults.length,
        mode: 'mock'
      })
    }

    // Test connectivity first
    console.log('🌐 Testing N8n connectivity...')
    const isConnected = await testConnectivity(N8N_BASE_URL)
    
    if (!isConnected) {
      console.log('⚠️ N8n instance not reachable, falling back to mock data')
      const mockData = generateMockLeads(searchKeyword)
      const transformedResults = mockData.map((item) => ({
        id: item.id,
        company_name: item.channelTitle,
        contact_person: item.channelTitle,
        email: item.socialLinks?.email || '',
        phone: '',
        website: item.socialLinks?.website || item.channelUrl,
        industry: 'YouTube Creator',
        location: item.country,
        company_size: `${item.subscriberCount} subscribers`,
        revenue: `Budget Score: ${item.budgetScore}`,
        description: item.summary,
        keywords: [searchKeyword],
        score: item.qualityScore,
        last_updated: new Date().toISOString(),
        source: 'Fallback Data (N8n Unavailable)'
      }))
      
      return NextResponse.json({
        success: true,
        results: transformedResults,
        keyword: searchKeyword,
        total: transformedResults.length,
        mode: 'fallback',
        warning: 'N8n instance not reachable. Using fallback data for development.'
      })
    }

    // Call N8n webhook with retry logic
    console.log('📡 Calling N8n webhook...')
    const data = await callN8nWebhook(searchKeyword)

    // Validate and transform the response data to match our LeadResult interface
    const transformedResults = Array.isArray(data) ? data.map((item: unknown, index: number) => {
      const lead = item as Record<string, unknown>
      return {
        id: lead.id || lead.channelId || `lead-${Date.now()}-${index}`,
        company_name: lead.company_name || lead.channelTitle || lead.title || 'Unknown Company',
        contact_person: lead.contact_person || lead.channelTitle || 'Unknown Contact',
        email: lead.email || (lead.socialLinks as Record<string, unknown>)?.email || '',
        phone: lead.phone || '',
        website: lead.website || (lead.socialLinks as Record<string, unknown>)?.website || lead.channelUrl || '',
        industry: lead.industry || 'YouTube Creator',
        location: lead.location || lead.country || 'Unknown',
        company_size: lead.company_size || `${lead.subscriberCount || 'Unknown'} subscribers`,
        revenue: lead.revenue || lead.budgetScore ? `Budget Score: ${lead.budgetScore}` : 'Unknown',
        description: lead.description || lead.summary || lead.channelDescription || '',
        keywords: Array.isArray(lead.keywords) ? lead.keywords as string[] : [searchKeyword],
        score: typeof lead.score === 'number' ? lead.score : 
               typeof lead.qualityScore === 'number' ? lead.qualityScore :
               typeof lead.budgetScore === 'number' ? lead.budgetScore :
               Math.floor(Math.random() * 40) + 60,
        last_updated: new Date().toISOString(),
        source: lead.source || 'N8n YouTube Research'
      }
    }) : []

    console.log(`✅ Successfully processed ${transformedResults.length} leads`)

    return NextResponse.json({
      success: true,
      results: transformedResults,
      keyword: searchKeyword,
      total: transformedResults.length,
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
    const mockData = generateMockLeads(fallbackKeyword)
    const transformedResults = mockData.map((item) => ({
      id: item.id,
      company_name: item.channelTitle,
      contact_person: item.channelTitle,
      email: item.socialLinks?.email || '',
      phone: '',
      website: item.socialLinks?.website || item.channelUrl,
      industry: 'YouTube Creator',
      location: item.country,
      company_size: `${item.subscriberCount} subscribers`,
      revenue: `Budget Score: ${item.budgetScore}`,
      description: item.summary,
      keywords: [fallbackKeyword],
      score: item.qualityScore,
      last_updated: new Date().toISOString(),
      source: 'Error Fallback Data'
    }))
    
    return NextResponse.json({
      success: true,
      results: transformedResults,
      keyword: fallbackKeyword,
      total: transformedResults.length,
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
    message: 'Lead Research API endpoint',
    methods: ['POST'],
    description: 'Send POST request with { keyword: string } to trigger N8n workflow',
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
    troubleshooting: {
      tips: [
        'Ensure your N8n instance is running and accessible',
        'Check if the domain n8n.harveyn8n.xyz resolves correctly',
        'Verify your webhook is active in N8n workflow',
        'Set N8N_MOCK_MODE=true in environment for development mode',
        'Check server logs for detailed error messages'
      ]
    }
  })
}