"use server"

import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { randomBytes } from "crypto"

export async function setupAdmin({
  username,
  password,
  enableTOTP,
}: {
  username: string
  password: string
  enableTOTP: boolean
}) {
  try {
    // Check if setup has already been completed
    const existingUser = await db.user.findFirst()

    if (existingUser) {
      return {
        success: false,
        error: "Setup has already been completed",
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate TOTP secret if 2FA is enabled
    let totpSecret = ""
    let totpUrl = ""

    if (enableTOTP) {
      // In a real implementation, use a library like speakeasy to generate a proper TOTP secret
      totpSecret = randomBytes(20).toString("hex")
      totpUrl = `otpauth://totp/LinkByte:${username}?secret=${totpSecret}&issuer=LinkByte`
    }

    // Create admin user
    await db.user.create({
      data: {
        username,
        password: hashedPassword,
        role: "ADMIN",
        totpEnabled: enableTOTP,
        totpSecret: enableTOTP ? totpSecret : null,
      },
    })

    // Set a cookie to indicate setup is complete
    const cookieStore = await cookies()
    cookieStore.set("setup-complete", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })

    return {
      success: true,
      totpSecret: enableTOTP ? totpSecret : null,
      totpUrl: enableTOTP ? totpUrl : null,
    }
  } catch (error) {
    console.error("Setup error:", error)
    return {
      success: false,
      error: "Failed to create admin account",
    }
  }
}
