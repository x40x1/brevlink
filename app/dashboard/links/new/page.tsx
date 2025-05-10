"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { z } from "zod"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createLink } from "@/app/dashboard/links/actions"

// Define the schema with required customSlug field
const linkFormSchema = z.object({
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
  title: z.string().min(1, {
    message: "Title is required.",
  }),
  customSlug: z.boolean(),
  slug: z.string().optional(),
})

// Make sure our type definition exactly matches the schema
type LinkFormValues = {
  url: string;
  title: string;
  customSlug: boolean;
  slug?: string;
}

export default function NewLinkPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Be explicit about the form type
  const form = useForm<LinkFormValues>({
    // Cast the resolver to avoid type issues
    resolver: zodResolver(linkFormSchema) as any,
    defaultValues: {
      url: "",
      title: "",
      customSlug: false,
      slug: "",
    },
  })

  const { customSlug } = form.watch()

  // Type the onSubmit function properly
  async function onSubmit(values: LinkFormValues) {
    try {
      setIsLoading(true)
      setError(null)

      const result = await createLink({
        url: values.url,
        title: values.title,
        slug: customSlug ? values.slug : undefined,
        generateSlug: !customSlug,
      })

      if (result.success) {
        toast({
          title: "Link created",
          description: "Your short link has been created successfully.",
        })
        router.push("/dashboard/links")
      } else {
        setError(result.error || "Failed to create link. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Create Link" text="Create a new short link." />

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Link Details</CardTitle>
            <CardDescription>Enter the details for your new short link.</CardDescription>
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
              <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
                <FormField
                  control={form.control as any}
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
                  control={form.control as any}
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
                  control={form.control as any}
                  name="customSlug"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Custom Short Link</FormLabel>
                        <FormDescription>
                          Create a custom slug instead of using a randomly generated one.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {customSlug && (
                  <FormField
                    control={form.control as any}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Slug</FormLabel>
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
                )}

                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Link
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
