'use client'

import React, { useState } from 'react';
import NavigationDock from '@/components/navigation-dock';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import { MagicCard } from '@/components/magicui/magic-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export default function KanbanPage() {
  const [columns] = useState<Column[]>([
    {
      id: 'todo',
      title: 'To Do',
      tasks: [
        {
          id: '1',
          title: 'Design user interface',
          description: 'Create mockups for the new dashboard',
          priority: 'high',
          assignee: 'John Doe'
        },
        {
          id: '2',
          title: 'Review code',
          description: 'Code review for pull request #123',
          priority: 'medium',
          assignee: 'Jane Smith'
        }
      ]
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: [
        {
          id: '3',
          title: 'Implement authentication',
          description: 'Add login and registration functionality',
          priority: 'high',
          assignee: 'Mike Johnson'
        }
      ]
    },
    {
      id: 'done',
      title: 'Done',
      tasks: [
        {
          id: '4',
          title: 'Setup project structure',
          description: 'Initialize Next.js project with TypeScript',
          priority: 'medium',
          assignee: 'Sarah Wilson'
        },
        {
          id: '5',
          title: 'Database schema design',
          description: 'Design and implement database schema',
          priority: 'high',
          assignee: 'Alex Brown'
        }
      ]
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getColumnColor = (columnId: string) => {
    switch (columnId) {
      case 'todo': return 'border-blue-500';
      case 'in-progress': return 'border-yellow-500';
      case 'done': return 'border-green-500';
      default: return 'border-gray-500';
    }
  };

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
                Organize and track your tasks with a visual workflow
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* Kanban Content */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-80">
              <div className={`bg-gray-800 rounded-lg border-2 ${getColumnColor(column.id)} p-4`}>
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">{column.title}</h3>
                    <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                      {column.tasks.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* Tasks */}
                <div className="space-y-3">
                  {column.tasks.map((task) => (
                    <MagicCard key={task.id} className="p-4 bg-gray-700 border-gray-600 hover:bg-gray-650 cursor-pointer">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="text-white font-medium text-sm">{task.title}</h4>
                          <Badge className={`${getPriorityColor(task.priority)} text-white text-xs`}>
                            {task.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-400 text-sm">{task.description}</p>
                        
                        {task.assignee && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                {task.assignee.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="text-gray-300 text-xs">{task.assignee}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </MagicCard>
                  ))}
                  
                  {/* Add Task Button */}
                  <Button
                    variant="outline"
                    className="w-full bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white border-dashed"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add a task
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add Column */}
          <div className="flex-shrink-0 w-80">
            <Button
              variant="outline"
              className="w-full h-24 bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white border-dashed"
            >
              <Plus className="h-6 w-6 mr-2" />
              Add Column
            </Button>
          </div>
        </div>
        
        {/* Info Note */}
        <div className="mt-8 text-center text-gray-500">
          <p className="text-sm">Advanced Kanban functionality with drag-and-drop will be integrated in the next update</p>
        </div>
      </div>

      <NavigationDock />
    </div>
  );
}