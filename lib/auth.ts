// Server-side auth functionality
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { db } from "@/lib/db"
import { compare, hash } from "bcrypt"

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

// Server-side function to get the current user
export async function getUserServer() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    // Verify the token
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_for_development_only"),
    )

    // Get the user ID from the token
    const userId = verified.payload.sub

    if (!userId) {
      return null
    }

    // Get the user from the database
    const user = await db.user.findUnique({
      where: {
        id: userId as string,
      },
    })

    return user
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}

// Client-side compatible function - this is a placeholder which just returns the user info from an API endpoint
export async function getUser() {
  // This will be called in client components
  try {
    const response = await fetch('/api/auth/me', { 
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Include credentials to send cookies with the request
      credentials: 'include'
    })
    
    if (!response.ok) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error("Client auth error:", error)
    return null
  }
}

export async function checkSetupStatus() {
  // Check if the setup-complete cookie exists
  const cookieStore = await cookies()
  const setupComplete = cookieStore.has("setup-complete")

  if (setupComplete) {
    return true
  }

  // If not, check the database for users
  const userCount = await db.user.count()

  return userCount > 0
}
