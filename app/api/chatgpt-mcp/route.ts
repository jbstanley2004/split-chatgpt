import { type NextRequest, NextResponse } from "next/server"

/**
 * API Route for ChatGPT MCP Integration
 * This acts as a proxy to the MCP server or handles requests directly
 */

// In-memory session store (use Redis or database in production)
const sessions = new Map<string, any>()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { method, params, id } = body

    // Handle different MCP methods
    switch (method) {
      case "tools/list":
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            tools: [
              {
                name: "split_start_onboarding",
                description: "Start the Split Payments merchant onboarding process",
                inputSchema: { type: "object", properties: {} },
              },
              {
                name: "split_authenticate",
                description: "Authenticate user for Split Payments",
                inputSchema: {
                  type: "object",
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                    isSignUp: { type: "boolean" },
                    name: { type: "string" },
                  },
                  required: ["email", "password"],
                },
              },
              {
                name: "split_save_business_info",
                description: "Save business information",
                inputSchema: {
                  type: "object",
                  properties: {
                    legalBusinessName: { type: "string" },
                    dbaName: { type: "string" },
                    ein: { type: "string" },
                    businessType: { type: "string" },
                    phoneNumber: { type: "string" },
                  },
                  required: ["legalBusinessName", "ein", "businessType", "phoneNumber"],
                },
              },
              {
                name: "split_save_owner_info",
                description: "Save owner information",
                inputSchema: {
                  type: "object",
                  properties: {
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    ssn: { type: "string" },
                    dateOfBirth: { type: "string" },
                    ownershipPercentage: { type: "number" },
                  },
                  required: ["firstName", "lastName", "ssn", "dateOfBirth", "ownershipPercentage"],
                },
              },
              {
                name: "split_save_business_address",
                description: "Save business address",
                inputSchema: {
                  type: "object",
                  properties: {
                    streetAddress: { type: "string" },
                    city: { type: "string" },
                    state: { type: "string" },
                    zipCode: { type: "string" },
                  },
                  required: ["streetAddress", "city", "state", "zipCode"],
                },
              },
              {
                name: "split_save_bank_account",
                description: "Save bank account for deposits",
                inputSchema: {
                  type: "object",
                  properties: {
                    bankName: { type: "string" },
                    accountType: { type: "string" },
                    routingNumber: { type: "string" },
                    accountNumber: { type: "string" },
                    accountHolderName: { type: "string" },
                  },
                  required: ["bankName", "accountType", "routingNumber", "accountNumber", "accountHolderName"],
                },
              },
              {
                name: "split_save_processing_details",
                description: "Save processing details",
                inputSchema: {
                  type: "object",
                  properties: {
                    averageTicketSize: { type: "number" },
                    monthlyVolume: { type: "number" },
                    businessDescription: { type: "string" },
                    salesMethod: { type: "string" },
                  },
                  required: ["averageTicketSize", "monthlyVolume", "businessDescription", "salesMethod"],
                },
              },
              {
                name: "split_submit_application",
                description: "Submit the completed merchant application",
                inputSchema: {
                  type: "object",
                  properties: {
                    termsAccepted: { type: "boolean" },
                    electronicSignature: { type: "string" },
                  },
                  required: ["termsAccepted", "electronicSignature"],
                },
              },
            ],
          },
        })

      case "tools/call":
        return handleToolCall(params, id)

      case "resources/list":
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            resources: [
              { uri: "ui://widget/auth.html", name: "Auth Widget" },
              { uri: "ui://widget/business-info.html", name: "Business Info Widget" },
              { uri: "ui://widget/owner-info.html", name: "Owner Info Widget" },
              { uri: "ui://widget/business-address.html", name: "Business Address Widget" },
              { uri: "ui://widget/bank-account.html", name: "Bank Account Widget" },
              { uri: "ui://widget/processing-details.html", name: "Processing Details Widget" },
              { uri: "ui://widget/confirmation.html", name: "Confirmation Widget" },
            ],
          },
        })

      default:
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: "Method not found" },
        })
    }
  } catch (error) {
    console.error("MCP Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function handleToolCall(params: any, id: string) {
  const { name, arguments: args } = params
  const sessionId = params._meta?.["openai/subject"] || `session_${Date.now()}`

  const session = sessions.get(sessionId) || {
    authenticated: false,
    currentStep: 0,
    profile: {},
    applicationId: null,
  }

  const SPLIT_API_URL = process.env.SPLIT_API_URL || "https://www.ccsplit.org/api"
  const SPLIT_API_KEY = process.env.SPLIT_API_KEY

  let result: any

  switch (name) {
    case "split_start_onboarding":
      result = {
        structuredContent: {
          type: "start_auth",
          isAuthenticated: session.authenticated,
          message: "Welcome to Split Payments!",
        },
        _meta: { "openai/outputTemplate": "ui://widget/auth.html" },
      }
      break

    case "split_authenticate":
      try {
        const authResponse = await fetch(`${SPLIT_API_URL}/auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": SPLIT_API_KEY || "",
          },
          body: JSON.stringify({
            email: args.email,
            password: args.password,
            isSignUp: args.isSignUp,
            name: args.name,
          }),
        })

        if (!authResponse.ok) {
          throw new Error("Authentication failed")
        }

        const authData = await authResponse.json()

        const appResponse = await fetch(`${SPLIT_API_URL}/portal/application`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": SPLIT_API_KEY || "",
          },
          body: JSON.stringify({
            userId: authData.userId,
            email: args.email,
          }),
        })

        if (!appResponse.ok) {
          throw new Error("Failed to create application")
        }

        const appData = await appResponse.json()

        session.authenticated = true
        session.email = args.email
        session.userId = authData.userId
        session.applicationId = appData.applicationId
        session.currentStep = 1
        sessions.set(sessionId, session)

        result = {
          structuredContent: {
            type: "auth_success",
            step: 1,
            totalSteps: 5,
          },
          _meta: { "openai/outputTemplate": "ui://widget/business-info.html" },
        }
      } catch (error) {
        result = {
          structuredContent: {
            type: "auth_error",
            error: error instanceof Error ? error.message : "Authentication failed",
          },
          _meta: { "openai/outputTemplate": "ui://widget/auth.html" },
        }
      }
      break

    case "split_save_business_info":
      try {
        await fetch(`${SPLIT_API_URL}/portal/application/${session.applicationId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": SPLIT_API_KEY || "",
          },
          body: JSON.stringify({ businessInfo: args }),
        })

        session.profile.businessInfo = args
        session.currentStep = 2
        sessions.set(sessionId, session)

        result = {
          structuredContent: { type: "business_info_saved", step: 2, totalSteps: 5 },
          _meta: { "openai/outputTemplate": "ui://widget/owner-info.html" },
        }
      } catch (error) {
        result = {
          structuredContent: { type: "save_error", error: "Failed to save business info" },
        }
      }
      break

    case "split_save_owner_info":
      try {
        await fetch(`${SPLIT_API_URL}/portal/application/${session.applicationId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": SPLIT_API_KEY || "",
          },
          body: JSON.stringify({ ownerInfo: args }),
        })

        session.profile.ownerInfo = args
        session.currentStep = 3
        sessions.set(sessionId, session)

        result = {
          structuredContent: { type: "owner_info_saved", step: 3, totalSteps: 5 },
          _meta: { "openai/outputTemplate": "ui://widget/business-address.html" },
        }
      } catch (error) {
        result = {
          structuredContent: { type: "save_error", error: "Failed to save owner info" },
        }
      }
      break

    case "split_save_business_address":
      try {
        await fetch(`${SPLIT_API_URL}/portal/application/${session.applicationId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": SPLIT_API_KEY || "",
          },
          body: JSON.stringify({ businessAddress: args }),
        })

        session.profile.businessAddress = args
        session.currentStep = 4
        sessions.set(sessionId, session)

        result = {
          structuredContent: { type: "address_saved", step: 4, totalSteps: 5 },
          _meta: { "openai/outputTemplate": "ui://widget/bank-account.html" },
        }
      } catch (error) {
        result = {
          structuredContent: { type: "save_error", error: "Failed to save address" },
        }
      }
      break

    case "split_save_bank_account":
      try {
        await fetch(`${SPLIT_API_URL}/portal/application/${session.applicationId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": SPLIT_API_KEY || "",
          },
          body: JSON.stringify({ bankAccount: args }),
        })

        session.profile.bankAccount = {
          ...args,
          accountNumber: `****${args.accountNumber.slice(-4)}`,
        }
        session.currentStep = 5
        sessions.set(sessionId, session)

        result = {
          structuredContent: { type: "bank_saved", step: 5, totalSteps: 5 },
          _meta: { "openai/outputTemplate": "ui://widget/processing-details.html" },
        }
      } catch (error) {
        result = {
          structuredContent: { type: "save_error", error: "Failed to save bank account" },
        }
      }
      break

    case "split_save_processing_details":
      try {
        await fetch(`${SPLIT_API_URL}/portal/application/${session.applicationId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": SPLIT_API_KEY || "",
          },
          body: JSON.stringify({ processingDetails: args }),
        })

        session.profile.processingDetails = args
        session.currentStep = 6
        sessions.set(sessionId, session)

        result = {
          structuredContent: {
            type: "ready_for_review",
            allComplete: true,
            profile: session.profile,
          },
          _meta: { "openai/outputTemplate": "ui://widget/confirmation.html" },
        }
      } catch (error) {
        result = {
          structuredContent: { type: "save_error", error: "Failed to save processing details" },
        }
      }
      break

    case "split_submit_application":
      try {
        const submitResponse = await fetch(`${SPLIT_API_URL}/portal/application/${session.applicationId}/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": SPLIT_API_KEY || "",
          },
          body: JSON.stringify({
            termsAccepted: args.termsAccepted,
            electronicSignature: args.electronicSignature,
          }),
        })

        if (!submitResponse.ok) {
          throw new Error("Failed to submit application")
        }

        const submitData = await submitResponse.json()
        sessions.delete(sessionId)

        result = {
          structuredContent: {
            type: "application_submitted",
            applicationId: submitData.applicationId,
            status: submitData.status,
          },
        }
      } catch (error) {
        result = {
          structuredContent: { type: "submit_error", error: "Failed to submit application" },
        }
      }
      break

    default:
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: "Tool not found" },
      })
  }

  return NextResponse.json({
    jsonrpc: "2.0",
    id,
    result,
  })
}

export async function GET(req: NextRequest) {
  // Health check endpoint
  return NextResponse.json({
    status: "ok",
    server: "split-payments-chatgpt-mcp",
    version: "1.0.0",
  })
}
