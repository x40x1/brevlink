"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Calendar, Clock, Globe, Loader2, MousePointerClick } from "lucide-react"
import { getLinkAnalytics } from "@/app/dashboard/links/actions"
import { formatDate, formatTime } from "@/lib/utils"

export default function LinkAnalyticsPage({
  params,
}: {
  params: { id: string }
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setIsLoading(true)
        const result = await getLinkAnalytics(params.id)

        if (result.success) {
          setData(result)
        } else {
          setError(result.error || "Failed to load analytics data")
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [params.id])

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Link Analytics" text="Loading analytics data..." />
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardShell>
    )
  }

  if (error || !data) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Link Analytics" text="There was a problem loading analytics.">
          <Link href="/dashboard/links">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Links
            </Button>
          </Link>
        </DashboardHeader>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Failed to load analytics data"}</AlertDescription>
        </Alert>
      </DashboardShell>
    )
  }

  const { link, clicks, stats } = data

  return (
    <DashboardShell>
      <DashboardHeader heading={`Analytics for ${link.title}`} text={`Performance data for /${link.slug}`}>
        <Link href="/dashboard/links">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Links
          </Button>
        </Link>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{link.clickCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDate(link.createdAt)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Click</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clicks.length > 0 ? formatDate(clicks[0].timestamp) : "No clicks yet"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Destination</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium truncate">{link.url}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Browsers</CardTitle>
            <CardDescription>Browser distribution of your visitors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.browsers).length > 0 ? (
                Object.entries(stats.browsers)
                  .sort((a, b) => b[1] - a[1])
                  .map(([browser, count]) => (
                    <div key={browser} className="flex items-center justify-between">
                      <span className="text-sm">{browser}</span>
                      <div className="flex items-center">
                        <span className="mr-2 text-sm font-medium">{count}</span>
                        <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${Math.round((count / link.clickCount) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Devices</CardTitle>
            <CardDescription>Device types used by your visitors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.devices).length > 0 ? (
                Object.entries(stats.devices)
                  .sort((a, b) => b[1] - a[1])
                  .map(([device, count]) => (
                    <div key={device} className="flex items-center justify-between">
                      <span className="text-sm">{device}</span>
                      <div className="flex items-center">
                        <span className="mr-2 text-sm font-medium">{count}</span>
                        <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${Math.round((count / link.clickCount) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Referrers</CardTitle>
            <CardDescription>Where your clicks are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.referrers).length > 0 ? (
                Object.entries(stats.referrers)
                  .sort((a, b) => b[1] - a[1])
                  .map(([referrer, count]) => (
                    <div key={referrer} className="flex items-center justify-between">
                      <span className="text-sm truncate max-w-[150px]" title={referrer}>
                        {referrer === "Direct" ? "Direct" : new URL(referrer).hostname}
                      </span>
                      <div className="flex items-center">
                        <span className="mr-2 text-sm font-medium">{count}</span>
                        <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${Math.round((count / link.clickCount) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Click History</CardTitle>
          <CardDescription>Detailed record of each click</CardDescription>
        </CardHeader>
        <CardContent>
          {clicks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Browser</TableHead>
                  <TableHead>Referrer</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clicks.map((click: any) => (
                  <TableRow key={click.id}>
                    <TableCell>
                      <div className="font-medium">{formatDate(click.timestamp)}</div>
                      <div className="text-xs text-muted-foreground">{formatTime(click.timestamp)}</div>
                    </TableCell>
                    <TableCell>{stats.devices[extractDevice(click.userAgent)]}</TableCell>
                    <TableCell>{stats.browsers[extractBrowser(click.userAgent)]}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{click.referer || "Direct"}</TableCell>
                    <TableCell>{click.ip}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground">No clicks recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  )
}

// Helper functions to extract browser and device info from user agent
function extractBrowser(ua: string): string {
  if (!ua) return "Unknown"

  if (ua.includes("Firefox")) return "Firefox"
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome"
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari"
  if (ua.includes("Edg")) return "Edge"
  if (ua.includes("MSIE") || ua.includes("Trident")) return "Internet Explorer"

  return "Other"
}

function extractDevice(ua: string): string {
  if (!ua) return "Unknown"

  if (ua.includes("iPhone")) return "iPhone"
  if (ua.includes("iPad")) return "iPad"
  if (ua.includes("Android") && ua.includes("Mobile")) return "Android Phone"
  if (ua.includes("Android")) return "Android Tablet"
  if (ua.includes("Windows")) return "Windows"
  if (ua.includes("Macintosh")) return "Mac"
  if (ua.includes("Linux")) return "Linux"

  return "Other"
}
