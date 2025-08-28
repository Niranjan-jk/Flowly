'use client'

import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid"
import { Ripple } from "@/components/magicui/ripple"
import { DotPattern } from "@/components/magicui/dot-pattern"
import { GridPattern } from "@/components/magicui/grid-pattern"
import { cn } from "@/lib/utils"
import { 
  Users, 
  Mail, 
  Calendar, 
  Settings, 
  FileText,
  Folder,
  User,
  Search,
  Kanban,
  Twitter
} from "lucide-react"

interface BentoGridProps {
  className?: string
}

export default function DashboardBentoGrid({ className }: BentoGridProps) {
  const items = [
    {
      name: "CRM Management",
      description: "Manage your client relationships and track outreach progress",
      background: <SkeletonOne />,
      Icon: Users,
      href: "/crm",
      cta: "Open CRM",
      className: "col-span-3 lg:col-span-1"
    },
    {
      name: "Email Templates",
      description: "Create and manage email templates for outreach campaigns",
      background: <SkeletonTwo />,
      Icon: Mail,
      href: "/email-templates",
      cta: "Manage Templates",
      className: "col-span-3 lg:col-span-1"
    },
    {
      name: "Calendar & Scheduling",
      description: "Schedule follow-ups and track important dates",
      background: <SkeletonThree />,
      Icon: Calendar,
      href: "/calendar",
      cta: "Open Calendar",
      className: "col-span-3 lg:col-span-1"
    },
    {
      name: "Client Documents",
      description: "Organize and manage documents and assets for your clients",
      background: <SkeletonFour />,
      Icon: Folder,
      href: "/client-docs",
      cta: "Manage Docs",
      className: "col-span-3 lg:col-span-2"
    },
    {
      name: "Lead Research",
      description: "AI-powered lead research and prospect discovery",
      background: <SkeletonFive />,
      Icon: Search,
      href: "/lead-research",
      cta: "Research Leads",
      className: "col-span-3 lg:col-span-1"
    },
    {
      name: "Kanban Board",
      description: "Visual task management and workflow organization",
      background: <SkeletonSix />,
      Icon: Kanban,
      href: "/kanban",
      cta: "Open Board",
      className: "col-span-3 lg:col-span-1"
    },
    {
      name: "Viral Posts",
      description: "Generate viral Twitter content with AI assistance",
      background: <SkeletonSeven />,
      Icon: Twitter,
      href: "/viral-posts",
      cta: "Create Posts",
      className: "col-span-3 lg:col-span-1"
    }
  ]

  return (
    <div className={cn("mb-8", className)}>
      <BentoGrid>
        {items.map((item, i) => (
          <BentoCard
            key={item.name}
            name={item.name}
            description={item.description}
            background={item.background}
            Icon={item.Icon}
            href={item.href}
            cta={item.cta}
            className={item.className}
          />
        ))}
      </BentoGrid>
    </div>
  )
}

const SkeletonOne = () => {
  return (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 relative overflow-hidden">
      <Ripple />
    </div>
  )
}

const SkeletonTwo = () => {
  return (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 relative overflow-hidden">
      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
        )}
      />
    </div>
  )
}

const SkeletonThree = () => {
  return (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 relative overflow-hidden">
      <GridPattern
        squares={[
          [4, 4],
          [5, 1],
          [8, 2],
          [5, 3],
          [5, 5],
          [10, 10],
          [12, 15],
          [15, 8],
          [7, 11],
          [2, 6],
          [13, 3],
          [9, 14],
        ]}
        className={cn(
          "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
        )}
      />
    </div>
  )
}

const SkeletonFour = () => {
  return (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 relative overflow-hidden">
      <Ripple />
    </div>
  )
}

const SkeletonFive = () => {
  return (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 relative overflow-hidden">
      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
        )}
      />
    </div>
  )
}

const SkeletonSix = () => {
  return (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 relative overflow-hidden">
      <GridPattern
        squares={[
          [3, 7],
          [6, 2],
          [11, 4],
          [8, 9],
          [14, 12],
          [1, 5],
          [16, 8],
          [4, 13],
          [9, 1],
          [12, 7],
          [5, 11],
          [18, 3],
        ]}
        className={cn(
          "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
        )}
      />
    </div>
  )
}

const SkeletonSeven = () => {
  return (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 relative overflow-hidden">
      <Ripple />
    </div>
  )
}