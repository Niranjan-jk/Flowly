"use client";

import { useState, useMemo, useEffect } from "react";
import { getDay } from "date-fns";
import { useCalendarContext } from "@/components/calendar-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

import {
  EventCalendar,
  type CalendarEvent,
  type EventColor,
} from "@/components";

// Etiquettes data for calendar filtering
export const etiquettes = [
  {
    id: "my-events",
    name: "My Events",
    color: "emerald" as EventColor,
    isActive: true,
  },
  {
    id: "marketing-team",
    name: "Marketing Team",
    color: "orange" as EventColor,
    isActive: true,
  },
  {
    id: "interviews",
    name: "Interviews",
    color: "violet" as EventColor,
    isActive: true,
  },
  {
    id: "events-planning",
    name: "Events Planning",
    color: "blue" as EventColor,
    isActive: true,
  },
  {
    id: "holidays",
    name: "Holidays",
    color: "rose" as EventColor,
    isActive: true,
  },
];

// Function to calculate days until next Sunday
const getDaysUntilNextSunday = (date: Date) => {
  const day = getDay(date); // 0 is Sunday, 6 is Saturday
  return day === 0 ? 0 : 7 - day; // If today is Sunday, return 0, otherwise calculate days until Sunday
};

// Store the current date to avoid repeated new Date() calls
const currentDate = new Date();




export default function Component() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { isColorVisible } = useCalendarContext();

  // Load events from Supabase on component mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error loading events:', error);
        toast.error('Failed to load calendar events');
      } else {
        // Transform database events to CalendarEvent format
        const transformedEvents: CalendarEvent[] = (data || []).map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          start: new Date(event.start_time),
          end: new Date(event.end_time),
          allDay: event.all_day || false,
          color: event.color as EventColor,
          location: event.location
        }));
        setEvents(transformedEvents);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  // Filter events based on visible colors
  const visibleEvents = useMemo(() => {
    return events.filter((event) => isColorVisible(event.color));
  }, [events, isColorVisible]);

  const handleEventAdd = async (event: CalendarEvent) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      const eventData = {
        user_id: user.id,
        title: event.title,
        description: event.description || null,
        start_time: event.start.toISOString(),
        end_time: event.end.toISOString(),
        all_day: event.allDay || false,
        color: event.color,
        location: event.location || null
      };

      const { data, error } = await supabase
        .from('calendar_events')
        .insert([eventData])
        .select()
        .single();

      if (error) {
        console.error('Error adding event:', error);
        toast.error('Failed to add event');
      } else {
        // Transform and add the new event to local state
        const newEvent: CalendarEvent = {
          id: data.id,
          title: data.title,
          description: data.description,
          start: new Date(data.start_time),
          end: new Date(data.end_time),
          allDay: data.all_day,
          color: data.color as EventColor,
          location: data.location
        };
        setEvents(prev => [...prev, newEvent]);
        toast.success('Event added successfully');
      }
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('Failed to add event');
    }
  };

  const handleEventUpdate = async (updatedEvent: CalendarEvent) => {
    try {
      const eventData = {
        title: updatedEvent.title,
        description: updatedEvent.description || null,
        start_time: updatedEvent.start.toISOString(),
        end_time: updatedEvent.end.toISOString(),
        all_day: updatedEvent.allDay || false,
        color: updatedEvent.color,
        location: updatedEvent.location || null
      };

      const { error } = await supabase
        .from('calendar_events')
        .update(eventData)
        .eq('id', updatedEvent.id);

      if (error) {
        console.error('Error updating event:', error);
        toast.error('Failed to update event');
      } else {
        setEvents(prev =>
          prev.map(event =>
            event.id === updatedEvent.id ? updatedEvent : event
          )
        );
        toast.success('Event updated successfully');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      } else {
        setEvents(prev => prev.filter(event => event.id !== eventId));
        toast.success('Event deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <EventCalendar
      events={visibleEvents}
      onEventAdd={handleEventAdd}
      onEventUpdate={handleEventUpdate}
      onEventDelete={handleEventDelete}
      initialView="week"
    />
  );
}
