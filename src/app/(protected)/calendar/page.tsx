'use client'

import NavigationDock from "@/components/navigation-dock";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/sidebar";
import BigCalendar from "@/components/big-calendar";

export default function CalendarPage() {
  return (
    <div className="min-h-screen pb-20 ">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-2 pt-0">
            <BigCalendar />
          </div>
        </SidebarInset>
      </SidebarProvider>
      <NavigationDock />
    </div>
  );
}
