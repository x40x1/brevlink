"use client"

import Link from "next/link"
import { ExternalLink, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"

interface LinkListProps {
  links: Array<{
    id: string
    slug: string
    url: string
    title: string
    clickCount: number
    createdAt: string
  }>
}

export function LinkList({ links }: LinkListProps) {
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null)
  
  const copyToClipboard = (slug: string, id: string) => {
    // Get the base URL from the window object when in browser
    const baseUrl = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : ""
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

  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-muted-foreground">No links found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {links.map((link) => (
        <div key={link.id} className="flex items-center justify-between border-b pb-4 last:border-0">
          <div className="grid gap-1">
            <div className="font-medium">{link.title}</div>
            <div className="text-sm text-muted-foreground">/{link.slug}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">{link.clickCount} clicks</div>
            <div className="text-xs text-muted-foreground">{formatDate(link.createdAt)}</div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => copyToClipboard(link.slug, link.id)}
              aria-label="Copy link to clipboard"
            >
              {copiedLinkId === link.id ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Link href={`/dashboard/links/${link.id}`}>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </Link>
            <Link href={link.url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
