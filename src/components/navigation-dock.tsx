'use client'

import { Dock, DockIcon } from "@/components/magicui/dock"
import { useRouter, usePathname } from "next/navigation"
import { 
  Home, 
  Users, 
  Mail, 
  Calendar, 
  Folder, 
  Settings,
  LogOut,
  Search,
  Kanban
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function NavigationDock() {
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/dashboard",
      isActive: pathname === "/dashboard"
    },
    {
      icon: Users,
      label: "CRM",
      href: "/crm",
      isActive: pathname === "/crm"
    },
    {
      icon: Mail,
      label: "Email Templates",
      href: "/email-templates",
      isActive: pathname === "/email-templates"
    },
    {
      icon: Calendar,
      label: "Calendar",
      href: "/calendar",
      isActive: pathname === "/calendar"
    },
    {
      icon: Kanban,
      label: "Kanban Board",
      href: "/kanban",
      isActive: pathname === "/kanban"
    },
    {
      icon: Search,
      label: "Lead Research",
      href: "/lead-research",
      isActive: pathname === "/lead-research"
    },
    {
      icon: Folder,
      label: "Client Documents",
      href: "/client-docs",
      isActive: pathname === "/client-docs"
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/settings",
      isActive: pathname === "/settings"
    }
  ]

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <Dock className="bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg">
        {navItems.map((item, index) => {
          const IconComponent = item.icon
          return (
            <DockIcon key={index}>
              <Button
                variant={item.isActive ? "default" : "ghost"}
                size="icon"
                onClick={() => router.push(item.href)}
                className={`h-10 w-10 ${
                  item.isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
                title={item.label}
              >
                <IconComponent className="h-4 w-4" />
              </Button>
            </DockIcon>
          )
        })}
        
        <DockIcon>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="h-10 w-10 hover:bg-red-100 hover:text-red-600"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </DockIcon>
      </Dock>
    </div>
  )
}