import { redirect } from "next/navigation"
import { getDashboardStats } from "@/app/dashboard/actions"
import { getUserServer } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LinkList } from "@/components/dashboard/link-list"
import { RecentClicks } from "@/components/dashboard/recent-clicks"
import { Link2, MousePointerClick, TrendingUp } from "lucide-react"

export default async function DashboardPage() {
  // Check authentication
  const user = await getUserServer()

  if (!user) {
    redirect("/login")
  }

  // Get dashboard statistics
  const { totalLinks, totalClicks, topLinks, recentClicks } = await getDashboardStats()

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Overview of your short links and analytics." />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Links</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLinks}</div>
            <p className="text-xs text-muted-foreground">Active short links in your account</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
            <p className="text-xs text-muted-foreground">Clicks on all your links</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0}</div>
            <p className="text-xs text-muted-foreground">Average clicks per link</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Top Performing Links</CardTitle>
            <CardDescription>Your most clicked short links</CardDescription>
          </CardHeader>
          <CardContent>
            <LinkList links={topLinks.map(link => ({
              ...link,
              createdAt: link.createdAt.toISOString()
            }))} />
          </CardContent>
        </Card>
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest clicks on your links</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentClicks clicks={recentClicks.map(click => ({
              ...click,
              timestamp: click.timestamp.toISOString(),
              referer: click.referer || ""
            }))} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
