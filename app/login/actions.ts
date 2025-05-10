"use server"

import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { verifyPassword } from "@/lib/auth"
import { SignJWT } from "jose"

export async function login({
  username,
  password,
  totpCode,
}: {
  username: string
  password: string
  totpCode?: string
}) {
  try {
    // Find user by username
    const user = await db.user.findUnique({
      where: {
        username
      },
    })

    if (!user) {
      return {
        success: false,
        error: "Invalid username or password",
      }
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.password)

    if (!passwordValid) {
      return {
        success: false,
        error: "Invalid username or password",
      }
    }

    // If 2FA is enabled, verify TOTP code
    if (user.totpEnabled) {
      // On first login attempt without TOTP code, prompt for it
      if (!totpCode) {
        return {
          success: false,
          requiresTOTP: true,
          error: null,
        }
      }

      // In a real implementation, verify the TOTP code using a library like speakeasy
      const totpValid = totpCode === "123456" // This is a mock validation - replace with actual TOTP validation

      if (!totpValid) {
        return {
          success: false,
          requiresTOTP: true,
          error: "Invalid verification code",
        }
      }
    }

    // Create a JWT
    const token = await new SignJWT({ sub: user.id, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_for_development_only"))

    // Set the token in a cookie
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      error: "An error occurred during login",
    }
  }
}
