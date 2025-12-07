import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/lib/api-auth"

const applications = new Map<string, any>()

export async function POST(req: NextRequest) {
  const isInternalRequest = req.headers.get("x-internal-request") === "true"
  if (!isInternalRequest && !validateApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { userId } = body

    // Check for existing draft application
    let application = Array.from(applications.values()).find((app) => app.userId === userId && app.status === "draft")

    if (!application) {
      application = {
        id: `app_${Date.now().toString(36)}`,
        userId,
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        businessInfo: null,
        ownerInfo: null,
        businessAddress: null,
        bankAccount: null,
        processingDetails: null,
      }
      applications.set(application.id, application)
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const applicationId = searchParams.get("id")
  const userId = searchParams.get("userId")

  if (applicationId) {
    const application = applications.get(applicationId)
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }
    return NextResponse.json(application)
  }

  if (userId) {
    const userApplications = Array.from(applications.values()).filter((app) => app.userId === userId)
    return NextResponse.json(userApplications)
  }

  return NextResponse.json({ error: "Missing applicationId or userId" }, { status: 400 })
}

export { applications }
