"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { login } from "@/app/login/actions"

const loginSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
})

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTOTPInput, setShowTOTPInput] = useState(false)
  const [totpCode, setTotpCode] = useState("")
  const router = useRouter()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      setIsLoading(true)
      setError(null)

      const result = await login({
        username: values.username,
        password: values.password,
        totpCode: showTOTPInput ? totpCode : undefined,
      })

      if (result.success) {
        if (result.requiresTOTP) {
          setShowTOTPInput(true)
        } else {
          toast({
            title: "Login successful",
            description: "Welcome back to LinkByte!",
          })
          router.push("/dashboard")
        }
      } else {
        setError(result.error || "Invalid username or password")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function submitTOTP() {
    try {
      setIsLoading(true)
      setError(null)

      const username = form.getValues("username")
      const password = form.getValues("password")

      const result = await login({
        username,
        password,
        totpCode,
      })

      if (result.success) {
        toast({
          title: "Login successful",
          description: "Welcome back to LinkByte!",
        })
        router.push("/dashboard")
      } else {
        setError(result.error || "Invalid verification code")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Login to LinkByte</CardTitle>
          <CardDescription>Enter your credentials to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!showTOTPInput ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Log In
                </Button>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <FormItem>
                <FormLabel>Two-Factor Authentication Code</FormLabel>
                <Input
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </FormItem>
              <Button onClick={submitTOTP} className="w-full" disabled={isLoading || totpCode.length !== 6}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setShowTOTPInput(false)} disabled={isLoading}>
                Back
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}
