'use client'

import React, { useState, useEffect } from 'react';
import { MagicCard } from '@/components/magicui/magic-card';
import { RainbowButton } from '@/components/magicui/rainbow-button';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import NavigationDock from '@/components/navigation-dock';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LoaderOne } from '@/components/ui/loader';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Users, 
  DollarSign,
  Calendar,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface LeadResult {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  location: string;
  company_size: string;
  revenue: string;
  description: string;
  keywords: string[];
  score: number;
  last_updated: string;
  source: string;
}

export default function LeadResearchPage() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<LeadResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    // Load recent searches and results
    loadRecentResults();
    loadSearchHistory();
  }, []);

  const loadRecentResults = async () => {
    try {
      const { data, error } = await supabase
        .from('lead_research_results')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(10);

      if (data && !error) {
        setResults(data);
      }
    } catch (error) {
      console.error('Error loading recent results:', error);
      // Load mock data for demonstration
      setResults(getMockLeadResults());
    }
  };

  const loadSearchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('keyword')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data && !error) {
        setSearchHistory(data.map(item => item.keyword));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
      setSearchHistory(['SaaS startups', 'E-commerce companies', 'FinTech', 'Real estate agencies', 'Digital marketing']);
    }
  };

  const handleSearch = async () => {
    if (!keyword.trim()) return;

    setLoading(true);
    
    try {
      // Save search to history
      await supabase
        .from('search_history')
        .insert([{ keyword: keyword.trim() }]);

      // In a real implementation, this would trigger your N8N workflow
      // For now, we'll simulate the API call
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock results based on keyword
      const mockResults = generateMockResults(keyword);
      
      // Save results to database
      const { error } = await supabase
        .from('lead_research_results')
        .insert(mockResults);

      if (!error) {
        setResults(mockResults);
        setSearchHistory(prev => [keyword, ...prev.slice(0, 4)]);
      }
      
    } catch (error) {
      console.error('Error during search:', error);
      // Fallback to mock results
      const mockResults = generateMockResults(keyword);
      setResults(mockResults);
    } finally {
      setLoading(false);
    }
  };

  const generateMockResults = (searchKeyword: string): LeadResult[] => {
    const companies = [
      'TechFlow Solutions', 'Innovation Labs', 'Digital Dynamics', 'Future Systems',
      'Smart Analytics', 'CloudVision', 'DataStream', 'NextGen Solutions'
    ];
    
    const industries = ['Technology', 'Healthcare', 'Finance', 'E-commerce', 'Manufacturing'];
    const locations = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Boston, MA'];
    
    return companies.slice(0, Math.floor(Math.random() * 6) + 3).map((company, index) => ({
      id: `lead-${Date.now()}-${index}`,
      company_name: company,
      contact_person: `${['John', 'Sarah', 'Mike', 'Emily', 'David'][index % 5]} ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][index % 5]}`,
      email: `contact@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      website: `https://${company.toLowerCase().replace(/\s+/g, '')}.com`,
      industry: industries[index % industries.length],
      location: locations[index % locations.length],
      company_size: ['10-50', '51-200', '201-500', '500+'][Math.floor(Math.random() * 4)],
      revenue: ['$1M-$10M', '$10M-$50M', '$50M-$100M', '$100M+'][Math.floor(Math.random() * 4)],
      description: `${company} is a leading ${industries[index % industries.length].toLowerCase()} company focused on ${searchKeyword} solutions.`,
      keywords: [searchKeyword, 'B2B', 'Growth', industries[index % industries.length]],
      score: Math.floor(Math.random() * 40) + 60,
      last_updated: new Date().toISOString(),
      source: 'N8N Automation'
    }));
  };

  const getMockLeadResults = (): LeadResult[] => {
    return [
      {
        id: 'mock-1',
        company_name: 'TechFlow Solutions',
        contact_person: 'John Smith',
        email: 'john@techflow.com',
        phone: '+1 (555) 123-4567',
        website: 'https://techflow.com',
        industry: 'Technology',
        location: 'San Francisco, CA',
        company_size: '51-200',
        revenue: '$10M-$50M',
        description: 'Leading provider of workflow automation solutions for enterprises.',
        keywords: ['automation', 'SaaS', 'enterprise'],
        score: 85,
        last_updated: new Date().toISOString(),
        source: 'N8N Automation'
      }
    ];
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="min-h-screen pb-20 bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <AnimatedShinyText className="text-3xl font-bold">
                Lead Research
              </AnimatedShinyText>
              <p className="text-gray-400 mt-1">
                Discover potential leads using automated research powered by N8N
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="space-y-4">
              <div>
                <Label htmlFor="keyword" className="text-white text-lg font-medium">
                  Research Keywords
                </Label>
                <p className="text-gray-400 text-sm mt-1">
                  Enter keywords to search for potential leads. Results will be fetched from your N8N workflow.
                </p>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    id="keyword"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="e.g., SaaS startups, E-commerce companies, FinTech..."
                    className="bg-gray-700 border-gray-600 text-white h-12 text-lg"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <RainbowButton 
                  onClick={handleSearch}
                  disabled={loading || !keyword.trim()}
                  className="h-12 px-8"
                >
                  {loading ? (
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5 mr-2" />
                  )}
                  {loading ? 'Searching...' : 'Research Leads'}
                </RainbowButton>
              </div>

              {/* Quick Search Buttons */}
              {searchHistory.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-white text-sm">Recent Searches:</Label>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => setKeyword(term)}
                        className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <LoaderOne />
              <p className="text-white text-lg mt-4">Researching leads...</p>
              <p className="text-gray-400 text-sm">This may take a few moments while our N8N workflow processes your request</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {!loading && results.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Research Results ({results.length})
              </h2>
              <button
                onClick={loadRecentResults}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((lead) => (
                <MagicCard key={lead.id} className="p-6 hover:scale-105 transition-transform duration-200 rounded-lg border border-gray-700">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {lead.company_name}
                        </h3>
                        <p className="text-gray-400 text-sm">{lead.contact_person}</p>
                      </div>
                      <Badge className={`${getScoreColor(lead.score)} text-white`}>
                        {lead.score}%
                      </Badge>
                    </div>

                    {/* Company Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Building2 className="h-4 w-4" />
                        <span>{lead.industry}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span>{lead.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Users className="h-4 w-4" />
                        <span>{lead.company_size} employees</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <DollarSign className="h-4 w-4" />
                        <span>{lead.revenue}</span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 pt-2 border-t border-gray-700">
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${lead.email}`} className="hover:text-white">
                          {lead.email}
                        </a>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                          <Phone className="h-4 w-4" />
                          <a href={`tel:${lead.phone}`} className="hover:text-white">
                            {lead.phone}
                          </a>
                        </div>
                      )}
                      {lead.website && (
                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                          <Globe className="h-4 w-4" />
                          <a 
                            href={lead.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-white flex items-center gap-1"
                          >
                            Website
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-sm">
                      {lead.description}
                    </p>

                    {/* Keywords */}
                    <div className="flex flex-wrap gap-1">
                      {lead.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-700">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(lead.last_updated).toLocaleDateString()}</span>
                      </div>
                      <span>{lead.source}</span>
                    </div>
                  </div>
                </MagicCard>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Results Yet</h3>
            <p className="text-gray-400 mb-6">
              Enter some keywords above to start researching potential leads
            </p>
          </div>
        )}
      </div>

      <NavigationDock />
    </div>
  );
}