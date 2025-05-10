import type React from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { SiteHeader } from "@/components/dashboard/site-header"
import { getUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Toaster } from "@/components/ui/toaster"
import { UserNav } from "@/components/dashboard/user-nav"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Check authentication
  const user = await getUserServer()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="container py-6 grid flex-1 gap-6 md:gap-8 md:grid-cols-[220px_1fr]">
        <aside className="hidden w-[220px] flex-col md:flex sticky top-[4.5rem] self-start h-[calc(100vh-6rem)]">
          <DashboardNav />
        </aside>
        <div className="flex flex-col w-full">
          <div className="flex justify-end mb-4">
            <UserNav />
          </div>
          <main className="flex w-full flex-1 flex-col overflow-hidden">{children}</main>
        </div>
      </div>
      <footer className="border-t mt-10">
        <div className="container flex h-14 items-center justify-between py-4 text-sm">
          <p className="text-muted-foreground">© {new Date().getFullYear()} LinkByte</p>
        </div>
      </footer>
      <Toaster />
    </div>
  )
}
