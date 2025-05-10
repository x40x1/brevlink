"use server"

import { db } from "@/lib/db"
import { getUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { generateRandomSlug } from "@/lib/utils"

export async function getLinks() {
  try {
    // Ensure user is authenticated
    const user = await getUserServer()
    if (!user) {
      redirect("/login")
    }

    // Get all links
    return await db.link.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })
  } catch (error) {
    console.error("Error fetching links:", error)
    return []
  }
}

export async function getLink(id: string) {
  try {
    // Ensure user is authenticated
    const user = await getUserServer()
    if (!user) {
      redirect("/login")
    }

    // Get the link
    return await db.link.findUnique({
      where: { id },
    })
  } catch (error) {
    console.error("Error fetching link:", error)
    return null
  }
}

export async function createLink({
  url,
  title,
  slug,
  generateSlug = false,
}: {
  url: string
  title: string
  slug?: string
  generateSlug?: boolean
}) {
  try {
    // Ensure user is authenticated
    const user = await getUserServer()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Validate URL
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url
    }

    // Generate or validate slug
    let finalSlug = slug

    if (generateSlug || !finalSlug) {
      finalSlug = generateRandomSlug()
    }

    // Check if slug is already in use
    if (finalSlug) {
      const existingLink = await db.link.findUnique({
        where: { slug: finalSlug },
      })

      if (existingLink) {
        return {
          success: false,
          error: "This short link is already in use. Please choose a different one.",
        }
      }
    }

    // Check for reserved paths
    const reservedPaths = ["login", "setup", "dashboard", "api"]
    if (finalSlug && reservedPaths.includes(finalSlug)) {
      return {
        success: false,
        error: "This slug is reserved. Please choose a different one.",
      }
    }

    // Create link
    const link = await db.link.create({
      data: {
        url,
        title,
        slug: finalSlug || generateRandomSlug(),
        clickCount: 0,
      },
    })

    revalidatePath("/dashboard/links")

    return {
      success: true,
      link,
    }
  } catch (error) {
    console.error("Error creating link:", error)
    return {
      success: false,
      error: "Failed to create link. Please try again.",
    }
  }
}

export async function updateLink({
  id,
  url,
  title,
  slug,
}: {
  id: string
  url: string
  title: string
  slug: string
}) {
  try {
    // Ensure user is authenticated
    const user = await getUserServer()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Get the current link
    const currentLink = await db.link.findUnique({
      where: { id },
    })

    if (!currentLink) {
      return { success: false, error: "Link not found" }
    }

    // Validate URL
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url
    }

    // Check if slug is changing and if it's already in use
    if (slug !== currentLink.slug) {
      const existingLink = await db.link.findUnique({
        where: { slug },
      })

      if (existingLink) {
        return {
          success: false,
          error: "This short link is already in use. Please choose a different one.",
        }
      }

      // Check for reserved paths
      const reservedPaths = ["login", "setup", "dashboard", "api"]
      if (reservedPaths.includes(slug)) {
        return {
          success: false,
          error: "This slug is reserved. Please choose a different one.",
        }
      }
    }

    // Update link
    const updatedLink = await db.link.update({
      where: { id },
      data: {
        url,
        title,
        slug,
      },
    })

    revalidatePath("/dashboard/links")
    revalidatePath(`/dashboard/links/${id}`)

    return {
      success: true,
      link: updatedLink,
    }
  } catch (error) {
    console.error("Error updating link:", error)
    return {
      success: false,
      error: "Failed to update link. Please try again.",
    }
  }
}

export async function deleteLink(id: string) {
  try {
    // Ensure user is authenticated
    const user = await getUserServer()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Delete all clicks associated with the link
    await db.click.deleteMany({
      where: { linkId: id },
    })

    // Delete the link
    await db.link.delete({
      where: { id },
    })

    revalidatePath("/dashboard/links")

    return { success: true }
  } catch (error) {
    console.error("Error deleting link:", error)
    return {
      success: false,
      error: "Failed to delete link. Please try again.",
    }
  }
}

export async function getLinkAnalytics(id: string) {
  try {
    // Ensure user is authenticated
    const user = await getUserServer()
    if (!user) {
      redirect("/login")
    }

    // Get the link
    const link = await db.link.findUnique({
      where: { id },
    })

    if (!link) {
      return {
        success: false,
        error: "Link not found",
      }
    }

    // Get all clicks for the link
    const clicks = await db.click.findMany({
      where: { linkId: id },
      orderBy: { timestamp: "desc" },
    })

    // Calculate browser statistics
    const browsers: Record<string, number> = {}
    const devices: Record<string, number> = {}
    const referrers: Record<string, number> = {}

    clicks.forEach((click) => {
      // Extract browser from user agent (simplified)
      const browserInfo = extractBrowser(click.userAgent)
      browsers[browserInfo] = (browsers[browserInfo] || 0) + 1

      // Extract device from user agent (simplified)
      const deviceInfo = extractDevice(click.userAgent)
      devices[deviceInfo] = (devices[deviceInfo] || 0) + 1

      // Process referrer
      const referrer = click.referer || "Direct"
      referrers[referrer] = (referrers[referrer] || 0) + 1
    })

    return {
      success: true,
      link,
      clicks,
      stats: {
        browsers,
        devices,
        referrers,
      },
    }
  } catch (error) {
    console.error("Error fetching link analytics:", error)
    return {
      success: false,
      error: "Failed to fetch analytics data",
    }
  }
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
