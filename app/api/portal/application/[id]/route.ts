import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/lib/api-auth"

const applications = new Map<string, any>()

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const application = applications.get(id)

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 })
  }

  return NextResponse.json(application)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isInternalRequest = req.headers.get("x-internal-request") === "true"
  if (!isInternalRequest && !validateApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()

    let application = applications.get(id)
    if (!application) {
      application = {
        id,
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        businessInfo: null,
        ownerInfo: null,
        businessAddress: null,
        bankAccount: null,
        processingDetails: null,
      }
    }

    // Update application fields
    const updatedApplication = {
      ...application,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    applications.set(id, updatedApplication)

    return NextResponse.json(updatedApplication)
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
  }
}
