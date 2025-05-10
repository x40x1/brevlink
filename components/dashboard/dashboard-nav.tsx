"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { BarChart3, Link2 } from "lucide-react"

export function DashboardNav() {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <BarChart3 className="mr-2 h-4 w-4" />,
    },
    {
      title: "Links",
      href: "/dashboard/links",
      icon: <Link2 className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <nav className="grid items-start gap-2 pb-12">
      <div className="mb-4 px-2">
        <h3 className="text-sm font-medium text-muted-foreground">Navigation</h3>
      </div>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            pathname === item.href || pathname.startsWith(`${item.href}/`) 
              ? "bg-muted hover:bg-muted font-medium" 
              : "hover:bg-transparent",
            "justify-start h-9 px-3",
          )}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
