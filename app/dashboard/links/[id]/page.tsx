"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState, useEffect } from "react"
import { z } from "zod"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, Loader2, Trash, Link2, ExternalLink, ClipboardCopy } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getLink, updateLink, deleteLink } from "@/app/dashboard/links/actions"

const linkEditSchema = z.object({
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
  title: z.string().min(1, {
    message: "Title is required.",
  }),
  slug: z.string().min(1, {
    message: "Slug is required.",
  }),
})

type LinkEditValues = z.infer<typeof linkEditSchema>

export default function EditLinkPage({
  params,
}: {
  params: { id: string }
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [link, setLink] = useState<any>(null)
  const router = useRouter()

  const form = useForm<LinkEditValues>({
    resolver: zodResolver(linkEditSchema),
    defaultValues: {
      url: "",
      title: "",
      slug: "",
    },
  })

  // Fetch link data
  useEffect(() => {
    async function fetchLink() {
      try {
        const linkData = await getLink(params.id)
        if (linkData) {
          setLink(linkData)
          form.reset({
            url: linkData.url,
            title: linkData.title,
            slug: linkData.slug,
          })
        } else {
          setError("Link not found")
        }
      } catch (err) {
        setError("Failed to load link data")
        console.error(err)
      }
    }

    fetchLink()
  }, [params.id, form])

  async function onSubmit(values: LinkEditValues) {
    try {
      setIsLoading(true)
      setError(null)

      const result = await updateLink({
        id: params.id,
        url: values.url,
        title: values.title,
        slug: values.slug,
      })

      if (result.success) {
        toast({
          title: "Link updated",
          description: "Your short link has been updated successfully.",
        })
        router.push("/dashboard/links")
      } else {
        setError(result.error || "Failed to update link. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    try {
      setIsDeleting(true)

      const result = await deleteLink(params.id)

      if (result.success) {
        toast({
          title: "Link deleted",
          description: "Your short link has been deleted successfully.",
        })
        router.push("/dashboard/links")
      } else {
        setError(result.error || "Failed to delete link. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsDeleting(false)
    }
  }

  function copyToClipboard() {
    const baseUrl = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : ""
    const shortUrl = `${baseUrl}/${link?.slug}`

    navigator.clipboard.writeText(shortUrl)
    toast({
      title: "Link copied",
      description: "Short link copied to clipboard.",
    })
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Edit Link" text="Modify your short link details." />

      <div className="grid gap-8">
        {link && (
          <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Link2 className="h-5 w-5 mr-2 text-primary" />
              <div>
                <p className="text-sm font-medium">Short URL</p>
                <p className="text-sm text-muted-foreground">
                  {typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : ""}/
                  {link.slug}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <ClipboardCopy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(`/${link.slug}`, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </Button>
            </div>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Link Details</CardTitle>
            <CardDescription>Update the details for your short link.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/my-long-url" {...field} />
                      </FormControl>
                      <FormDescription>The full URL where users will be redirected.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="My Awesome Link" {...field} />
                      </FormControl>
                      <FormDescription>A name to help you identify this link.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <span className="mr-2 text-muted-foreground">yourdomain.com/</span>
                          <Input placeholder="custom-slug" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>Only letters, numbers, and hyphens are recommended.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" type="button" disabled={isDeleting}>
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Link
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your short link and all associated
                          analytics data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Link
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
