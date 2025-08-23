'use client'

import React, { useState } from 'react';
import NavigationDock from '@/components/navigation-dock';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  description?: string;
  type: 'meeting' | 'task' | 'reminder';
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Team Meeting',
      date: '2024-08-23',
      time: '10:00 AM',
      description: 'Weekly team sync',
      type: 'meeting'
    },
    {
      id: '2',
      title: 'Project Deadline',
      date: '2024-08-25',
      time: '5:00 PM',
      description: 'Complete project deliverables',
      type: 'task'
    },
    {
      id: '3',
      title: 'Client Call',
      date: '2024-08-26',
      time: '2:00 PM',
      description: 'Quarterly review with client',
      type: 'meeting'
    }
  ]);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-600';
      case 'task': return 'bg-green-600';
      case 'reminder': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="min-h-screen pb-20 bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <AnimatedShinyText className="text-3xl font-bold">
                Calendar
              </AnimatedShinyText>
              <p className="text-gray-400 mt-1">
                Manage your events, meetings, and schedule
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={goToPrevMonth}
                      className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={goToNextMonth}
                      className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-400 py-8">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-lg font-medium">Calendar View</p>
                  <p className="text-sm">Advanced calendar component will be integrated here</p>
                  <p className="text-xs mt-2">Use the events list on the right to view upcoming events</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events Sidebar */}
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Upcoming Events</CardTitle>
                <CardDescription className="text-gray-400">
                  Your scheduled events and tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{event.title}</h4>
                        <p className="text-gray-400 text-sm">{event.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-gray-300 text-sm">{event.date}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-300 text-sm">{event.time}</span>
                        </div>
                      </div>
                      <Badge className={`${getEventTypeColor(event.type)} text-white capitalize`}>
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button variant="outline" className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                  View Calendar Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <NavigationDock />
    </div>
  );
}