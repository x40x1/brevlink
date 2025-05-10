"use client"

import { FormDescription } from "@/components/ui/form"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { setupAdmin } from "@/app/setup/actions"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z
  .object({
    username: z.string().min(3, {
      message: "Username must be at least 3 characters.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
    enableTOTP: z.boolean({
      required_error: "EnableTOTP is required",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [setupStep, setSetupStep] = useState<"initial" | "totp" | "complete">("initial")
  const [totpSecret, setTotpSecret] = useState("")
  const [totpUrl, setTotpUrl] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      enableTOTP: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      setError(null)

      const result = await setupAdmin({
        username: values.username,
        password: values.password,
        enableTOTP: values.enableTOTP,
      })

      if (result.success) {
        if (values.enableTOTP) {
          setTotpSecret(result.totpSecret || "")
          setTotpUrl(result.totpUrl || "")
          setSetupStep("totp")
        } else {
          toast({
            title: "Setup complete!",
            description: "Your admin account has been created. You can now log in.",
          })
          setSetupStep("complete")
          setTimeout(() => {
            router.push("/login")
          }, 2000)
        }
      } else {
        setError(result.error || "Something went wrong. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function verifyTOTP() {
    try {
      setIsLoading(true)
      setError(null)

      // In a real implementation, call a server action to verify the TOTP code
      const result = await fetch("/api/verify-totp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: totpSecret,
          token: verificationCode,
        }),
      }).then((res) => res.json())

      if (result.success) {
        toast({
          title: "2FA setup complete!",
          description: "Your admin account has been created with 2FA enabled.",
        })
        setSetupStep("complete")
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setError("Invalid verification code. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (setupStep === "totp") {
    return (
      <div className="container max-w-md py-10">
        <Card>
          <CardHeader>
            <CardTitle>Set Up Two-Factor Authentication</CardTitle>
            <CardDescription>
              Scan the QR code with your authenticator app or enter the secret key manually.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center">
              <div className="border rounded p-4 bg-white">
                {/* In a real implementation, render a QR code here using totpUrl */}
                <div className="w-48 h-48 flex items-center justify-center bg-slate-100">QR Code Placeholder</div>
              </div>
            </div>

            <div className="space-y-2">
              <FormLabel>Secret Key (if you can't scan the QR code)</FormLabel>
              <Input value={totpSecret} readOnly onClick={(e) => e.currentTarget.select()} />
            </div>

            <div className="space-y-2">
              <FormLabel>Verification Code</FormLabel>
              <Input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={() => setSetupStep("initial")} disabled={isLoading}>
              Back
            </Button>
            <Button onClick={verifyTOTP} disabled={isLoading || verificationCode.length !== 6}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify & Complete Setup
            </Button>
          </CardFooter>
        </Card>
        <Toaster />
      </div>
    )
  }

  if (setupStep === "complete") {
    return (
      <div className="container max-w-md py-10">
        <Card>
          <CardHeader>
            <CardTitle>Setup Complete!</CardTitle>
            <CardDescription>Your admin account has been created successfully.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Redirecting you to login...</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
        <Toaster />
      </div>
    )
  }

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to LinkByte</CardTitle>
          <CardDescription>Complete the initial setup to create your admin account.</CardDescription>
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enableTOTP"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Enable Two-Factor Authentication</FormLabel>
                      <FormDescription>Use an authenticator app for additional security</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Admin Account
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}
