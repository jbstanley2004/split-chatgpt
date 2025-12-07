"use client"

import type React from "react"
import { createRoot } from "react-dom/client"
import { WidgetWrapper, useWidgetState, useToolOutput } from "./components/widget-wrapper"
import { Button } from "./components/button"

interface ConfirmationOutput {
  type: string
  step: number
  totalSteps: number
  allComplete: boolean
  profile: {
    businessInfo: any
    ownerInfo: any
    businessAddress: any
    bankAccount: any
    processingDetails: any
  }
  message: string
}

function ConfirmationWidget() {
  const output = useToolOutput<ConfirmationOutput>()
  const [widgetState, setWidgetState] = useWidgetState({
    termsAccepted: false,
    electronicSignature: "",
    loading: false,
    submitted: false,
    applicationId: "",
    error: "",
  })

  const profile = output?.profile

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!widgetState.termsAccepted || !widgetState.electronicSignature) {
      setWidgetState({ ...widgetState, error: "Please accept terms and provide your signature." })
      return
    }

    setWidgetState({ ...widgetState, loading: true, error: "" })

    try {
      const result = await window.openai.callTool("split_submit_application", {
        termsAccepted: widgetState.termsAccepted,
        electronicSignature: widgetState.electronicSignature,
      })

      setWidgetState({
        ...widgetState,
        loading: false,
        submitted: true,
        applicationId: result?.structuredContent?.applicationId || "",
      })
    } catch (err) {
      setWidgetState({
        ...widgetState,
        loading: false,
        error: "Failed to submit. Please try again.",
      })
    }
  }

  if (widgetState.submitted) {
    return (
      <WidgetWrapper title="Application Submitted!">
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "12px" }}>Congratulations!</h3>
          <p style={{ color: "#666", marginBottom: "24px" }}>
            Your Split Payments merchant application has been submitted successfully.
          </p>
          {widgetState.applicationId && (
            <p
              style={{
                backgroundColor: "#f3f4f6",
                padding: "12px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                marginBottom: "24px",
              }}
            >
              Application ID: <strong>{widgetState.applicationId}</strong>
            </p>
          )}
          <div style={{ backgroundColor: "#f0fdf4", padding: "16px", borderRadius: "8px", textAlign: "left" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px", color: "#166534" }}>What's Next?</h4>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "#166534", fontSize: "14px" }}>
              <li style={{ marginBottom: "8px" }}>Our team will review your application within 1-2 business days</li>
              <li style={{ marginBottom: "8px" }}>You'll receive an email with your approval status</li>
              <li>Once approved, you can start processing payments immediately</li>
            </ul>
          </div>
        </div>
      </WidgetWrapper>
    )
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div
      style={{
        padding: "16px",
        backgroundColor: "#f9fafb",
        borderRadius: "8px",
        marginBottom: "16px",
      }}
    >
      <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px", color: "#374151" }}>{title}</h4>
      {children}
    </div>
  )

  const Field = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value || "—"}</span>
    </div>
  )

  return (
    <WidgetWrapper title="Review Your Application">
      <p style={{ marginBottom: "24px", color: "#666", fontSize: "15px" }}>
        {output?.message || "Please review your information and submit your application."}
      </p>

      {profile?.businessInfo && (
        <Section title="Business Information">
          <Field label="Legal Name" value={profile.businessInfo.legalBusinessName} />
          <Field label="DBA" value={profile.businessInfo.dbaName} />
          <Field label="EIN" value={`**-***${profile.businessInfo.ein?.slice(-4) || "****"}`} />
          <Field label="Business Type" value={profile.businessInfo.businessType?.replace(/_/g, " ")} />
          <Field label="Phone" value={profile.businessInfo.phoneNumber} />
        </Section>
      )}

      {profile?.ownerInfo && (
        <Section title="Owner Information">
          <Field label="Name" value={`${profile.ownerInfo.firstName} ${profile.ownerInfo.lastName}`} />
          <Field label="Ownership" value={`${profile.ownerInfo.ownershipPercentage}%`} />
          <Field label="Title" value={profile.ownerInfo.title} />
        </Section>
      )}

      {profile?.businessAddress && (
        <Section title="Business Address">
          <Field label="Street" value={profile.businessAddress.streetAddress} />
          <Field
            label="City, State ZIP"
            value={`${profile.businessAddress.city}, ${profile.businessAddress.state} ${profile.businessAddress.zipCode}`}
          />
        </Section>
      )}

      {profile?.bankAccount && (
        <Section title="Bank Account">
          <Field label="Bank" value={profile.bankAccount.bankName} />
          <Field label="Account Type" value={profile.bankAccount.accountType} />
          <Field label="Account" value={profile.bankAccount.accountNumber} />
        </Section>
      )}

      {profile?.processingDetails && (
        <Section title="Processing Details">
          <Field label="Avg. Transaction" value={`$${profile.processingDetails.averageTicketSize}`} />
          <Field label="Monthly Volume" value={`$${profile.processingDetails.monthlyVolume?.toLocaleString()}`} />
          <Field label="Sales Method" value={profile.processingDetails.salesMethod?.replace(/_/g, " ")} />
        </Section>
      )}

      <form onSubmit={handleSubmit}>
        <div
          style={{
            padding: "16px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            marginTop: "24px",
            marginBottom: "16px",
          }}
        >
          <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={widgetState.termsAccepted}
              onChange={(e) => setWidgetState({ ...widgetState, termsAccepted: e.target.checked })}
              style={{ width: "20px", height: "20px", marginTop: "2px" }}
            />
            <span style={{ fontSize: "14px", lineHeight: 1.5 }}>
              I certify that the information provided is true and accurate. I have read and agree to the{" "}
              <a href="#" style={{ color: "#1a1a1a", textDecoration: "underline" }}>
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" style={{ color: "#1a1a1a", textDecoration: "underline" }}>
                Privacy Policy
              </a>
              .
            </span>
          </label>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }}>
            Electronic Signature
          </label>
          <input
            type="text"
            value={widgetState.electronicSignature}
            onChange={(e) => setWidgetState({ ...widgetState, electronicSignature: e.target.value })}
            placeholder="Type your full legal name"
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontFamily: "'Brush Script MT', cursive",
              boxSizing: "border-box",
            }}
          />
        </div>

        {widgetState.error && (
          <p style={{ color: "#ef4444", fontSize: "14px", marginBottom: "16px" }}>{widgetState.error}</p>
        )}

        <Button type="submit" fullWidth loading={widgetState.loading}>
          Submit Application
        </Button>
      </form>
    </WidgetWrapper>
  )
}

const root = createRoot(document.getElementById("root")!)
root.render(<ConfirmationWidget />)
