import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Database, Link2, LineChart, Shield } from "lucide-react"
import { checkSetupStatus } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  // Check if setup is complete
  const isSetupComplete = await checkSetupStatus()

  // If setup is incomplete, redirect to setup
  if (!isSetupComplete) {
    redirect("/setup")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center space-x-2">
              <Link2 className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg">brevlink</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline">Admin Login</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32 xl:py-40">
          <div className="container">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-3 max-w-[800px]">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white">
                  brevlink - Modern URL Shortener
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl">
                  Create short, memorable links for your content. Track clicks and analyze your audience.
                </p>
              </div>
              <div className="space-x-4 pt-3">
                <Link href="/login">
                  <Button size="lg" className="h-11 px-8">Access Dashboard</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="py-8 md:py-16 lg:py-24">
          <div className="container">
            <h2 className="text-2xl font-semibold mb-10 text-center">Key Features</h2>
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="group relative rounded-xl border bg-card p-6 shadow-md transition-all hover:shadow-lg">
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="mb-3">
                  <Shield className="h-10 w-10 text-primary p-2 rounded-lg bg-primary/10" />
                </div>
                <h3 className="text-lg font-semibold">Secure & Private</h3>
                <p className="mt-2 text-muted-foreground">
                  Complete admin control with optional 2FA and secure access to link management.
                </p>
              </div>
              <div className="group relative rounded-xl border bg-card p-6 shadow-md transition-all hover:shadow-lg">
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Database className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="mb-3">
                  <Database className="h-10 w-10 text-primary p-2 rounded-lg bg-primary/10" />
                </div>
                <h3 className="text-lg font-semibold">Flexible Storage</h3>
                <p className="mt-2 text-muted-foreground">
                  Use SQLite for simple deployments or upgrade to PostgreSQL for enterprise needs.
                </p>
              </div>
              <div className="group relative rounded-xl border bg-card p-6 shadow-md transition-all hover:shadow-lg">
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <LineChart className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="mb-3">
                  <LineChart className="h-10 w-10 text-primary p-2 rounded-lg bg-primary/10" />
                </div>
                <h3 className="text-lg font-semibold">Detailed Analytics</h3>
                <p className="mt-2 text-muted-foreground">
                  Track every click with detailed information about devices, browsers, and referrers.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © {new Date().getFullYear()} brevlink. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
