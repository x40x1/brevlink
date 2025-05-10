import { redirect } from "next/navigation"
import { getLink, recordLinkClick } from "@/app/[slug]/actions"
import { headers } from "next/headers"

export default async function ShortLinkPage(props: { params: { slug: string } }) {
  // Destructuring params properly to avoid sync issues with dynamic APIs
  const slug = props.params.slug

  // Check reserved paths that shouldn't be treated as short links
  if (["login", "setup", "dashboard", "api"].includes(slug)) {
    redirect(`/${slug}`)
  }

  // Get the link from the database
  const link = await getLink(slug)

  // If no link exists, show not found
  if (!link) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-2">Link Not Found</h1>
        <p className="text-muted-foreground mb-6">The link you're looking for doesn't exist.</p>
      </div>
    )
  }

  // Get request information for analytics
  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""
  const referer = headersList.get("referer") || ""
  const ip = headersList.get("x-forwarded-for") || "unknown"

  // Record the click
  await recordLinkClick({
    linkId: link.id,
    userAgent,
    referer,
    ip,
  })

  // Redirect to the original URL
  redirect(link.url)
}
