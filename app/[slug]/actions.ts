"use server"

import { db } from "@/lib/db"

export async function getLink(slug: string) {
  try {
    return await db.link.findUnique({
      where: { slug },
    })
  } catch (error) {
    console.error("Error fetching link:", error)
    return null
  }
}

export async function recordLinkClick({
  linkId,
  userAgent,
  referer,
  ip,
}: {
  linkId: string
  userAgent: string
  referer: string
  ip: string
}) {
  try {
    // Record click in the database
    await db.click.create({
      data: {
        linkId,
        userAgent,
        referer,
        ip,
        timestamp: new Date(),
      },
    })

    // Increment the click count on the link
    await db.link.update({
      where: { id: linkId },
      data: {
        clickCount: {
          increment: 1,
        },
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error recording click:", error)
    return { success: false }
  }
}
