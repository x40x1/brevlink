"use client"

import { redirect, useRouter } from "next/navigation"
import { getLinks } from "@/app/dashboard/links/actions"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { PlusCircle, Copy, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"

interface Link {
  id: string
  title: string
  url: string
  slug: string
  createdAt: Date
  updatedAt: Date
  clickCount: number
}

export default function LinksPage() {
  const [links, setLinks] = useState<Link[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null)
  
  // Function to copy link to clipboard
  const copyToClipboard = (slug: string, id: string) => {
    const baseUrl = `${window.location.protocol}//${window.location.host}`
    const fullUrl = `${baseUrl}/${slug}`
    
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedLinkId(id)
      toast({
        title: "Link copied",
        description: "Short link copied to clipboard.",
      })
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedLinkId(null)
      }, 2000)
    })
  }
  
  const router = useRouter()
  
  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get links - the server action will handle authentication
        const linksData = await getLinks()
        
        // If the server action redirected, we won't get here
        // but for safety, check if we got an error response
        if (!linksData || (Array.isArray(linksData) && linksData.length === 0)) {
          console.log("No links returned, possibly not authenticated")
        }
        
        setLinks(linksData)
      } catch (error) {
        console.error("Error loading data:", error)
        // If there was an authentication error, the API might have returned 401
        if (error instanceof Error && error.message.includes('401')) {
          router.push('/login')
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])
  
  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Links" text="Manage your short links.">
          <Link href="/dashboard/links/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Link
            </Button>
          </Link>
        </DashboardHeader>
        <div className="rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Title</TableHead>
                <TableHead className="w-[120px]">Slug</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead className="w-[80px] text-right">Clicks</TableHead>
                <TableHead className="w-[120px]">Created</TableHead>
                <TableHead className="w-[200px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span className="sr-only">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Links" text="Manage your short links.">
        <Link href="/dashboard/links/new">
          <Button className="h-9">
            <PlusCircle className="mr-1.5 h-4 w-4" />
            Add Link
          </Button>
        </Link>
      </DashboardHeader>

      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Title</TableHead>
              <TableHead className="w-[120px]">Slug</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead className="w-[80px] text-right">Clicks</TableHead>
              <TableHead className="w-[120px]">Created</TableHead>
              <TableHead className="w-[200px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
                    <p>No links found.</p>
                    <p className="text-sm">Create your first short link to get started.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {links.map((link) => (
              <TableRow key={link.id} className="group hover:bg-muted/40 transition-colors">
                <TableCell className="font-medium">{link.title}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span className="font-mono text-sm text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">{link.slug}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[250px] truncate">
                  <span className="text-muted-foreground">{link.url}</span>
                </TableCell>
                <TableCell className="text-right font-medium">{link.clickCount}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{formatDate(link.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(link.slug, link.id)}
                      aria-label="Copy link to clipboard"
                      className="h-8"
                    >
                      {copiedLinkId === link.id ? (
                        <Check className="mr-1.5 h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Copy
                    </Button>
                    <Link href={`/dashboard/links/${link.id}`}>
                      <Button variant="ghost" size="sm" className="h-8">
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/dashboard/links/${link.id}/analytics`}>
                      <Button variant="ghost" size="sm" className="h-8">
                        Analytics
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardShell>
  )
}
