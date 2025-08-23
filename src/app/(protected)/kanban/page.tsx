'use client';

import React from 'react';
import NavigationDock from '@/components/navigation-dock';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Kanban } from 'lucide-react';

export default function KanbanPage() {
  return (
    <div className="min-h-screen pb-20 bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <AnimatedShinyText className="text-3xl font-bold">
                Kanban Board
              </AnimatedShinyText>
              <p className="text-gray-400 mt-1">
                Advanced kanban component will be integrated soon
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Board
            </Button>
          </div>
        </div>
      </div>

      {/* Kanban Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Kanban className="h-5 w-5" />
              Kanban Board Component
            </CardTitle>
            <CardDescription className="text-gray-400">
              This page will feature an advanced kanban board component
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-400 py-12">
              <Kanban className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <p className="text-lg font-medium">Coming Soon</p>
              <p className="text-sm">Advanced kanban board with drag-and-drop functionality</p>
              <p className="text-xs mt-2">Will be integrated with project management features</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <NavigationDock />
    </div>
  );
}
