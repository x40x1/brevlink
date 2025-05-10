import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { secret, token } = body

    if (!secret || !token) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // In a real implementation, verify the TOTP token using a library like speakeasy
    // For demo purposes, we're using a simple mock validation (123456 is valid)
    const isValid = token === "123456"

    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("TOTP verification error:", error)
    return NextResponse.json({ success: false, error: "An error occurred" }, { status: 500 })
  }
}
