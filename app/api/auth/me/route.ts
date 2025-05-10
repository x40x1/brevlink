import { NextResponse } from "next/server"
import { getUserServer } from "@/lib/auth"

// API route to get the current user's information
export async function GET() {
  try {
    const user = await getUserServer()
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    
    // Return user data without sensitive information
    return NextResponse.json({
      id: user.id,
      username: user.username,
      role: user.role,
      // Don't include password or other sensitive data
    })
  } catch (error) {
    console.error("Error getting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
