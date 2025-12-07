import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/lib/api-auth"

const applications = new Map<string, any>()

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isInternalRequest = req.headers.get("x-internal-request") === "true"
  if (!isInternalRequest && !validateApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const { electronicSignature, termsAccepted } = body

    if (!termsAccepted) {
      return NextResponse.json({ error: "Terms must be accepted" }, { status: 400 })
    }

    const application = applications.get(id)
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Validate all required sections are complete
    const requiredSections = ["businessInfo", "ownerInfo", "businessAddress", "bankAccount", "processingDetails"]

    const missingSections = requiredSections.filter((section) => !application[section])

    if (missingSections.length > 0) {
      return NextResponse.json(
        {
          error: "Application incomplete",
          missingSections,
        },
        { status: 400 },
      )
    }

    // Update application status
    const submittedApplication = {
      ...application,
      status: "pending_review",
      electronicSignature,
      termsAccepted,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    applications.set(id, submittedApplication)

    // In production:
    // 1. Send confirmation email
    // 2. Notify underwriting team
    // 3. Create audit trail
    // 4. Trigger webhooks

    return NextResponse.json({
      applicationId: id,
      status: "pending_review",
      message: "Application submitted successfully",
      submittedAt: submittedApplication.submittedAt,
    })
  } catch (error) {
    console.error("Error submitting application:", error)
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
  }
}
