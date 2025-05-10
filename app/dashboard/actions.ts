"use server"

import { db } from "@/lib/db"
import { getUserServer } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function getDashboardStats() {
  try {
    // Ensure user is authenticated
    const user = await getUserServer()
    if (!user) {
      redirect("/login")
    }

    // Get total links count
    const totalLinks = await db.link.count()

    // Get total clicks count
    const totalClicks = await db.click.count()

    // Get top performing links
    const topLinks = await db.link.findMany({
      orderBy: {
        clickCount: "desc",
      },
      take: 5,
      select: {
        id: true,
        slug: true,
        url: true,
        title: true,
        clickCount: true,
        createdAt: true,
      },
    })

    // Get recent clicks
    const recentClicks = await db.click.findMany({
      orderBy: {
        timestamp: "desc",
      },
      take: 10,
      include: {
        link: {
          select: {
            slug: true,
            title: true,
          },
        },
      },
    })

    return {
      totalLinks,
      totalClicks,
      topLinks,
      recentClicks,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      totalLinks: 0,
      totalClicks: 0,
      topLinks: [],
      recentClicks: [],
    }
  }
}
