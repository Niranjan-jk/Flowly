"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from '@supabase/supabase-js';

export default function UserDisplay() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 bg-gray-700 rounded-full animate-pulse" />
        <div className="h-4 w-20 bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-6 w-6">
        <AvatarImage src={user?.user_metadata?.avatar_url} />
        <AvatarFallback className="bg-blue-600 text-white text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm text-gray-300 hidden sm:inline">
        {displayName}
      </span>
    </div>
  );
}
