'use client';

import React, { useState, useEffect } from 'react';
import NavigationDock from '@/components/navigation-dock';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import { RainbowButton } from '@/components/magicui/rainbow-button';
import PomodoroTimer from '@/components/pomodoro-timer';
import AppTimeTracker from '@/components/app-time-tracker';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  KanbanBoard,
  KanbanBoardProvider,
  KanbanBoardColumn,
  KanbanBoardColumnHeader,
  KanbanBoardColumnTitle,
  KanbanBoardColumnIconButton,
  KanbanBoardColumnList,
  KanbanBoardColumnListItem,
  KanbanBoardCard,
  KanbanBoardCardTitle,
  KanbanBoardCardDescription,
  KanbanBoardCardButton,
  KanbanBoardCardButtonGroup,
  KanbanBoardExtraMargin,
  KanbanColorCircle,
} from '@/components/kanban';

type Card = {
  id: string;
  title: string;
  description?: string;
  color?: 'primary' | 'destructive' | 'success' | 'warning' | 'info';
  column_id: string;
  position: number;
  user_id: string;
  created_at?: string;
  updated_at?: string;
};

type Column = {
  id: string;
  title: string;
  cards: Card[];
  position: number;
  user_id: string;
  created_at?: string;
};

export default function KanbanPage() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Card | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // Load data from Supabase on mount
  useEffect(() => {
    loadKanbanData();
  }, []);

  const loadKanbanData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Load columns
      const { data: columnsData, error: columnsError } = await supabase
        .from('kanban_columns')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (columnsError) {
        console.error('Error loading columns:', columnsError);
        // Check if it's a table not found error (database not set up)
        if (columnsError.code === 'PGRST116' || columnsError.message.includes('relation "kanban_columns" does not exist')) {
          toast.error('Database tables not found. Please run the database migration first.', {
            duration: 10000,
            description: 'Check DATABASE_SETUP.md for instructions'
          });
          // Create fallback columns for demo purposes
          const fallbackColumns: Column[] = [
            { id: 'demo-1', title: 'To Do', cards: [], position: 0, user_id: user.id },
            { id: 'demo-2', title: 'In Progress', cards: [], position: 1, user_id: user.id },
            { id: 'demo-3', title: 'Done', cards: [], position: 2, user_id: user.id }
          ];
          setColumns(fallbackColumns);
          setLoading(false);
          return;
        }
        // Try to create default columns if it's just missing data
        await createDefaultColumns(user.id);
        return;
      }

      // If no columns exist, create default ones
      if (!columnsData || columnsData.length === 0) {
        await createDefaultColumns(user.id);
        return;
      }

      // Load tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('kanban_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (tasksError) {
        console.error('Error loading tasks:', tasksError);
        if (tasksError.code === 'PGRST116' || tasksError.message.includes('relation "kanban_tasks" does not exist')) {
          // Tables don't exist, but we have columns - continue with empty tasks
          console.warn('Tasks table not found, continuing with empty tasks');
        } else {
          toast.error('Failed to load tasks');
        }
      }

      // Organize tasks by column
      const columnsWithTasks: Column[] = (columnsData || []).map(column => ({
        id: column.id,
        title: column.title,
        position: column.position,
        user_id: column.user_id,
        created_at: column.created_at,
        cards: (tasksData || []).filter(task => task.column_id === column.id).map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          color: task.color,
          column_id: task.column_id,
          position: task.position,
          user_id: task.user_id,
          created_at: task.created_at,
          updated_at: task.updated_at
        }))
      }));

      setColumns(columnsWithTasks);
    } catch (error) {
      console.error('Error loading kanban data:', error);
      toast.error('Failed to load kanban data');
      // Set fallback columns to ensure the UI works
      const fallbackColumns: Column[] = [
        { id: 'fallback-1', title: 'To Do', cards: [], position: 0, user_id: 'demo' },
        { id: 'fallback-2', title: 'In Progress', cards: [], position: 1, user_id: 'demo' },
        { id: 'fallback-3', title: 'Done', cards: [], position: 2, user_id: 'demo' }
      ];
      setColumns(fallbackColumns);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultColumns = async (userId: string) => {
    try {
      const defaultColumns = [
        { title: 'To Do', position: 0 },
        { title: 'In Progress', position: 1 },
        { title: 'Done', position: 2 }
      ];

      const { data, error } = await supabase
        .from('kanban_columns')
        .insert(defaultColumns.map(col => ({ ...col, user_id: userId })))
        .select();

      if (error) {
        console.error('Error creating default columns:', error);
        if (error.code === 'PGRST116' || error.message.includes('relation "kanban_columns" does not exist')) {
          toast.error('Database tables not found. Please run the database migration first.', {
            duration: 10000,
            description: 'Check DATABASE_SETUP.md for instructions'
          });
          // Create fallback columns for demo purposes
          const fallbackColumns: Column[] = defaultColumns.map((col, index) => ({
            id: `fallback-${index + 1}`,
            title: col.title,
            position: col.position,
            user_id: userId,
            cards: []
          }));
          setColumns(fallbackColumns);
        } else {
          toast.error('Failed to create default columns');
        }
      } else {
        const columnsWithTasks: Column[] = (data || []).map(column => ({
          id: column.id,
          title: column.title,
          position: column.position,
          user_id: column.user_id,
          created_at: column.created_at,
          cards: []
        }));
        setColumns(columnsWithTasks);
        toast.success('Created default kanban columns');
      }
    } catch (error) {
      console.error('Error creating default columns:', error);
      toast.error('Failed to create default columns');
      // Create fallback columns as last resort
      const fallbackColumns: Column[] = [
        { id: 'fallback-1', title: 'To Do', cards: [], position: 0, user_id: userId },
        { id: 'fallback-2', title: 'In Progress', cards: [], position: 1, user_id: userId },
        { id: 'fallback-3', title: 'Done', cards: [], position: 2, user_id: userId }
      ];
      setColumns(fallbackColumns);
    }
  };

  const handleDropOverColumn = async (dataTransferData: string, columnId: string) => {
    const cardData = JSON.parse(dataTransferData) as Card;
    
    // Update task column in database
    try {
      const { error } = await supabase
        .from('kanban_tasks')
        .update({ column_id: columnId })
        .eq('id', cardData.id);

      if (error) {
        console.error('Error updating task column:', error);
        toast.error('Failed to move task');
        return;
      }

      // Update local state
      setColumns(prev => {
        const newColumns = [...prev];
        
        // Remove card from its current column
        newColumns.forEach(column => {
          column.cards = column.cards.filter(card => card.id !== cardData.id);
        });
        
        // Add card to the target column
        const targetColumn = newColumns.find(col => col.id === columnId);
        if (targetColumn) {
          targetColumn.cards.push({ ...cardData, column_id: columnId });
        }
        
        return newColumns;
      });

      toast.success('Task moved successfully');
    } catch (error) {
      console.error('Error moving task:', error);
      toast.error('Failed to move task');
    }
  };

  const handleDropOverListItem = async (
    dataTransferData: string,
    dropDirection: 'top' | 'bottom' | 'none',
    targetCardId: string,
    columnId: string
  ) => {
    const cardData = JSON.parse(dataTransferData) as Card;
    
    try {
      // Update task position in database
      const { error } = await supabase
        .from('kanban_tasks')
        .update({ column_id: columnId })
        .eq('id', cardData.id);

      if (error) {
        console.error('Error updating task position:', error);
        toast.error('Failed to reorder task');
        return;
      }

      // Update local state
      setColumns(prev => {
        const newColumns = [...prev];
        
        // Remove card from its current column
        newColumns.forEach(column => {
          column.cards = column.cards.filter(card => card.id !== cardData.id);
        });
        
        // Find target column and card index
        const targetColumn = newColumns.find(col => col.id === columnId);
        if (targetColumn) {
          const targetCardIndex = targetColumn.cards.findIndex(card => card.id === targetCardId);
          if (targetCardIndex !== -1) {
            const insertIndex = dropDirection === 'top' ? targetCardIndex : targetCardIndex + 1;
            targetColumn.cards.splice(insertIndex, 0, { ...cardData, column_id: columnId });
          } else {
            targetColumn.cards.push({ ...cardData, column_id: columnId });
          }
        }
        
        return newColumns;
      });

      toast.success('Task reordered successfully');
    } catch (error) {
      console.error('Error reordering task:', error);
      toast.error('Failed to reorder task');
    }
  };

  const openAddTaskDialog = (columnId: string) => {
    setSelectedColumnId(columnId);
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskDialogOpen(true);
  };

  const openEditTaskDialog = (task: Card) => {
    setEditingTask(task);
    setSelectedColumnId(task.column_id);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setTaskDialogOpen(true);
  };

  const handleSaveTask = async () => {
    if (!taskTitle.trim()) {
      toast.error('Task title is required');
      return;
    }

    setSaveLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      if (editingTask) {
        // Update existing task
        const { error } = await supabase
          .from('kanban_tasks')
          .update({
            title: taskTitle,
            description: taskDescription || null,
          })
          .eq('id', editingTask.id);

        if (error) {
          console.error('Error updating task:', error);
          toast.error('Failed to update task');
        } else {
          // Update local state
          setColumns(prev => 
            prev.map(column => ({
              ...column,
              cards: column.cards.map(card => 
                card.id === editingTask.id 
                  ? { ...card, title: taskTitle, description: taskDescription }
                  : card
              )
            }))
          );
          toast.success('Task updated successfully');
          setTaskDialogOpen(false);
        }
      } else {
        // Create new task
        const { data, error } = await supabase
          .from('kanban_tasks')
          .insert([{
            user_id: user.id,
            column_id: selectedColumnId,
            title: taskTitle,
            description: taskDescription || null,
            position: 0,
            color: 'primary'
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating task:', error);
          if (error.code === 'PGRST116' || error.message.includes('relation "kanban_tasks" does not exist')) {
            // Database tables don't exist - create a demo task
            const demoTask: Card = {
              id: `demo-${Date.now()}`,
              title: taskTitle,
              description: taskDescription || undefined,
              color: 'primary',
              column_id: selectedColumnId,
              position: 0,
              user_id: user.id,
            };
            
            setColumns(prev => 
              prev.map(column => 
                column.id === selectedColumnId 
                  ? { ...column, cards: [...column.cards, demoTask] }
                  : column
              )
            );
            toast.success('Task created (demo mode - data will not persist)');
            setTaskDialogOpen(false);
          } else {
            toast.error('Failed to create task');
          }
        } else {
          // Add to local state
          const newTask: Card = {
            id: data.id,
            title: data.title,
            description: data.description,
            color: data.color,
            column_id: data.column_id,
            position: data.position,
            user_id: data.user_id,
            created_at: data.created_at,
            updated_at: data.updated_at
          };

          setColumns(prev => 
            prev.map(column => 
              column.id === selectedColumnId 
                ? { ...column, cards: [...column.cards, newTask] }
                : column
            )
          );
          toast.success('Task created successfully');
          setTaskDialogOpen(false);
        }
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('kanban_tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete task');
      } else {
        // Remove from local state
        setColumns(prev => 
          prev.map(column => ({
            ...column,
            cards: column.cards.filter(card => card.id !== taskId)
          }))
        );
        toast.success('Task deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading kanban board...</p>
          </div>
        </div>
        <NavigationDock />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <AnimatedShinyText className="text-xl font-semibold">
            ✨ Kanban Board
          </AnimatedShinyText>
          <div className="flex items-center gap-4">
            <RainbowButton
              onClick={() => {
                if (columns.length > 0) {
                  openAddTaskDialog(columns[0].id);
                }
              }}
              disabled={columns.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </RainbowButton>
          </div>
        </div>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Pomodoro Timer and App Tracker */}
        <div className="w-96 flex-shrink-0 p-6 border-r border-border">
          <div className="sticky top-6 space-y-6">
            <PomodoroTimer />
            <AppTimeTracker />
          </div>
        </div>
        
        {/* Right Content - Kanban Board */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full px-4 py-6 flex justify-center">
            <div className="w-full max-w-6xl">
          {columns.length > 0 && columns[0]?.id?.startsWith('fallback') && (
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Database Setup Required
                  </h3>
                  <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>Please run the database migration to enable data persistence. Check <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">DATABASE_SETUP.md</code> for instructions.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <KanbanBoardProvider>
            <KanbanBoard>
              {columns.map((column) => (
                <KanbanBoardColumn
                  key={column.id}
                  columnId={column.id}
                  onDropOverColumn={(data) => handleDropOverColumn(data, column.id)}
                >
                  <KanbanBoardColumnHeader>
                    <KanbanBoardColumnTitle columnId={column.id}>
                      {column.title}
                    </KanbanBoardColumnTitle>
                    <KanbanBoardColumnIconButton
                      onClick={() => openAddTaskDialog(column.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </KanbanBoardColumnIconButton>
                  </KanbanBoardColumnHeader>

                  <KanbanBoardColumnList>
                    {column.cards.map((card) => (
                      <KanbanBoardColumnListItem
                        key={card.id}
                        cardId={card.id}
                        onDropOverListItem={(data, direction) =>
                          handleDropOverListItem(data, direction, card.id, column.id)
                        }
                      >
                        <KanbanBoardCard data={card}>
                          <div className="flex items-start justify-between">
                            <KanbanBoardCardTitle>{card.title}</KanbanBoardCardTitle>
                            <KanbanBoardCardButtonGroup>
                              <KanbanBoardCardButton
                                tooltip="Edit task"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditTaskDialog(card);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </KanbanBoardCardButton>
                              <KanbanBoardCardButton
                                tooltip="Delete task"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTask(card.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </KanbanBoardCardButton>
                            </KanbanBoardCardButtonGroup>
                          </div>
                          {card.description && (
                            <KanbanBoardCardDescription>
                              {card.description}
                            </KanbanBoardCardDescription>
                          )}
                          {card.color && (
                            <div className="flex items-center mt-2">
                              <KanbanColorCircle color={card.color as 'primary' | 'gray' | 'red' | 'yellow' | 'green' | 'cyan' | 'blue' | 'indigo' | 'violet' | 'purple' | 'pink'} />
                            </div>
                          )}
                        </KanbanBoardCard>
                      </KanbanBoardColumnListItem>
                    ))}
                  </KanbanBoardColumnList>
                </KanbanBoardColumn>
              ))}
              <KanbanBoardExtraMargin />
            </KanbanBoard>
          </KanbanBoardProvider>
            </div>
          </div>
        </div>
      </div>

      {/* Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </DialogTitle>
            <DialogDescription>
              {editingTask 
                ? 'Update the task details below.'
                : 'Create a new task for your kanban board.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Enter task title..."
                className="col-span-3"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Enter task description..."
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setTaskDialogOpen(false)}
              disabled={saveLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTask} disabled={saveLoading}>
              {saveLoading ? 'Saving...' : editingTask ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NavigationDock />
    </div>
  );
}