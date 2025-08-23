'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { KTUISeparator } from '@/components/ui/ktui-separator';
import NavigationDock from '@/components/navigation-dock';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import { supabase } from '@/lib/supabase';
import { 
  User, 
  Mail, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Key, 
  Database,
  Save,
  Upload,
  Settings2
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  company: string;
  location: string;
  website: string;
  phone: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: true,
    security: true
  });

  const [preferences, setPreferences] = useState({
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY'
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Try to fetch additional profile data
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setProfile(data);
        } else {
          // Create basic profile from auth user
          setProfile({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            bio: '',
            company: '',
            location: '',
            website: '',
            phone: ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert([profile]);

      if (error) {
        console.error('Error saving profile:', error);
      } else {
        console.log('Profile saved successfully');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Settings2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: Database }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="animate-pulse text-white">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="border-b border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <AnimatedShinyText className="text-3xl font-bold">
                Settings
              </AnimatedShinyText>
              <p className="text-gray-400 mt-1">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {settingsTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover: hover:text-white'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6">
            {activeTab === 'profile' && (
              <Card className=" border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Profile Information</CardTitle>
                  <CardDescription className="text-gray-400">
                    Update your profile information and public details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-gray-700 text-white text-xl">
                        {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                        <Upload className="h-4 w-4 mr-2" />
                        Change Avatar
                      </Button>
                      <p className="text-sm text-gray-400">JPG, GIF or PNG. 1MB max.</p>
                    </div>
                  </div>

                  <KTUISeparator />

                  {/* Profile Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-white">Full Name</Label>
                      <Input
                        id="fullName"
                        value={profile?.full_name || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, full_name: e.target.value} : null)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile?.email || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, email: e.target.value} : null)}
                        className="bg-gray-700 border-gray-600 text-white"
                        disabled
                      />
                      <p className="text-xs text-gray-400">Email cannot be changed directly</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-white">Company</Label>
                      <Input
                        id="company"
                        value={profile?.company || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, company: e.target.value} : null)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-white">Location</Label>
                      <Input
                        id="location"
                        value={profile?.location || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, location: e.target.value} : null)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-white">Website</Label>
                      <Input
                        id="website"
                        value={profile?.website || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, website: e.target.value} : null)}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="https://"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white">Phone</Label>
                      <Input
                        id="phone"
                        value={profile?.phone || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, phone: e.target.value} : null)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-white">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile?.bio || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
                      className="bg-gray-700 border-gray-600 text-white"
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card className=" border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Notification Preferences</CardTitle>
                  <CardDescription className="text-gray-400">
                    Choose what notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
                    { key: 'push', label: 'Push Notifications', description: 'Receive push notifications in browser' },
                    { key: 'marketing', label: 'Marketing Emails', description: 'Receive updates about new features and promotions' },
                    { key: 'security', label: 'Security Alerts', description: 'Receive important security-related notifications' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">{item.label}</h4>
                        <p className="text-gray-400 text-sm">{item.description}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications[item.key as keyof typeof notifications]}
                        onChange={(e) => setNotifications(prev => ({
                          ...prev,
                          [item.key]: e.target.checked
                        }))}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {activeTab === 'preferences' && (
              <Card className=" border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Preferences</CardTitle>
                  <CardDescription className="text-gray-400">
                    Customize your application experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white">Theme</Label>
                      <Select value={preferences.theme} onValueChange={(value) => setPreferences(prev => ({...prev, theme: value}))}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Language</Label>
                      <Select value={preferences.language} onValueChange={(value) => setPreferences(prev => ({...prev, language: value}))}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Timezone</Label>
                      <Select value={preferences.timezone} onValueChange={(value) => setPreferences(prev => ({...prev, timezone: value}))}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="EST">EST</SelectItem>
                          <SelectItem value="PST">PST</SelectItem>
                          <SelectItem value="GMT">GMT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Date Format</Label>
                      <Select value={preferences.dateFormat} onValueChange={(value) => setPreferences(prev => ({...prev, dateFormat: value}))}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card className=" border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Security Settings</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your account security and authentication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">Change Password</h4>
                        <p className="text-gray-400 text-sm">Update your account password</p>
                      </div>
                      <Button variant="outline" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                        <Key className="h-4 w-4 mr-2" />
                        Change
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                        <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                      </div>
                      <Badge variant="secondary" className="bg-gray-700 text-gray-300">Not Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">Active Sessions</h4>
                        <p className="text-gray-400 text-sm">Manage your active login sessions</p>
                      </div>
                      <Button variant="outline" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                        View Sessions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'account' && (
              <Card className=" border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Account Settings</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your account settings and data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">Export Data</h4>
                        <p className="text-gray-400 text-sm">Download a copy of your data</p>
                      </div>
                      <Button variant="outline" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                        Export
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-red-600 rounded-lg">
                      <div>
                        <h4 className="text-red-400 font-medium">Delete Account</h4>
                        <p className="text-gray-400 text-sm">Permanently delete your account and data</p>
                      </div>
                      <Button variant="destructive">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'integrations' && (
              <Card className=" border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Integrations</CardTitle>
                  <CardDescription className="text-gray-400">
                    Connect your account with external services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {[
                      { name: 'Google Calendar', description: 'Sync your calendar events', connected: false },
                      { name: 'Slack', description: 'Receive notifications in Slack', connected: true },
                      { name: 'Zapier', description: 'Automate workflows', connected: false },
                      { name: 'N8N', description: 'Connect with N8N workflows', connected: true }
                    ].map((integration) => (
                      <div key={integration.name} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                        <div>
                          <h4 className="text-white font-medium">{integration.name}</h4>
                          <p className="text-gray-400 text-sm">{integration.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={integration.connected ? "default" : "secondary"} className={integration.connected ? "bg-green-600" : "bg-gray-700 text-gray-300"}>
                            {integration.connected ? 'Connected' : 'Not Connected'}
                          </Badge>
                          <Button variant="outline" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                            {integration.connected ? 'Disconnect' : 'Connect'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <NavigationDock />
    </div>
  );
}