"use client"

import type React from "react"
import { createRoot } from "react-dom/client"
import { WidgetWrapper, useWidgetState, useToolOutput } from "./components/widget-wrapper"
import { FormField } from "./components/form-field"
import { Button } from "./components/button"

interface BusinessInfoOutput {
  type: string
  step: number
  totalSteps: number
  message: string
}

function BusinessInfoWidget() {
  const output = useToolOutput<BusinessInfoOutput>()
  const [widgetState, setWidgetState] = useWidgetState({
    legalBusinessName: "",
    dbaName: "",
    ein: "",
    businessType: "",
    businessStartDate: "",
    website: "",
    phoneNumber: "",
    loading: false,
    errors: {} as Record<string, string>,
  })

  const validateEIN = (ein: string) => {
    const cleaned = ein.replace(/\D/g, "")
    return cleaned.length === 9
  }

  const formatEIN = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 9)
    if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`
    }
    return cleaned
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors: Record<string, string> = {}
    if (!widgetState.legalBusinessName) errors.legalBusinessName = "Required"
    if (!validateEIN(widgetState.ein)) errors.ein = "Invalid EIN format"
    if (!widgetState.businessType) errors.businessType = "Required"
    if (!widgetState.phoneNumber) errors.phoneNumber = "Required"

    if (Object.keys(errors).length > 0) {
      setWidgetState({ ...widgetState, errors })
      return
    }

    setWidgetState({ ...widgetState, loading: true, errors: {} })

    try {
      await window.openai.callTool("split_save_business_info", {
        legalBusinessName: widgetState.legalBusinessName,
        dbaName: widgetState.dbaName || undefined,
        ein: widgetState.ein.replace(/\D/g, ""),
        businessType: widgetState.businessType,
        businessStartDate: widgetState.businessStartDate || undefined,
        website: widgetState.website || undefined,
        phoneNumber: widgetState.phoneNumber,
      })
    } catch (err) {
      setWidgetState({
        ...widgetState,
        loading: false,
        errors: { submit: "Failed to save. Please try again." },
      })
    }
  }

  return (
    <WidgetWrapper title="Business Information" step={output?.step || 1} totalSteps={output?.totalSteps || 5}>
      <p style={{ marginBottom: "24px", color: "#666", fontSize: "15px" }}>
        {output?.message || "Let's start with your business details."}
      </p>

      <form onSubmit={handleSubmit}>
        <FormField
          label="Legal Business Name"
          name="legalBusinessName"
          value={widgetState.legalBusinessName}
          onChange={(v) => setWidgetState({ ...widgetState, legalBusinessName: v })}
          placeholder="ACME Corporation, Inc."
          required
          error={widgetState.errors.legalBusinessName}
        />

        <FormField
          label="DBA (Doing Business As)"
          name="dbaName"
          value={widgetState.dbaName}
          onChange={(v) => setWidgetState({ ...widgetState, dbaName: v })}
          placeholder="ACME Corp"
          helperText="Optional - if different from legal name"
        />

        <FormField
          label="EIN (Employer Identification Number)"
          name="ein"
          value={widgetState.ein}
          onChange={(v) => setWidgetState({ ...widgetState, ein: formatEIN(v) })}
          placeholder="XX-XXXXXXX"
          required
          error={widgetState.errors.ein}
          helperText="9-digit federal tax ID"
        />

        <FormField
          label="Business Type"
          name="businessType"
          type="select"
          value={widgetState.businessType}
          onChange={(v) => setWidgetState({ ...widgetState, businessType: v })}
          required
          error={widgetState.errors.businessType}
          options={[
            { value: "sole_proprietorship", label: "Sole Proprietorship" },
            { value: "llc", label: "LLC" },
            { value: "corporation", label: "Corporation" },
            { value: "partnership", label: "Partnership" },
            { value: "nonprofit", label: "Non-Profit" },
          ]}
        />

        <FormField
          label="Business Start Date"
          name="businessStartDate"
          type="date"
          value={widgetState.businessStartDate}
          onChange={(v) => setWidgetState({ ...widgetState, businessStartDate: v })}
        />

        <FormField
          label="Website"
          name="website"
          value={widgetState.website}
          onChange={(v) => setWidgetState({ ...widgetState, website: v })}
          placeholder="https://www.example.com"
          helperText="Optional"
        />

        <FormField
          label="Business Phone Number"
          name="phoneNumber"
          type="tel"
          value={widgetState.phoneNumber}
          onChange={(v) => setWidgetState({ ...widgetState, phoneNumber: v })}
          placeholder="(555) 123-4567"
          required
          error={widgetState.errors.phoneNumber}
        />

        {widgetState.errors.submit && (
          <p style={{ color: "#ef4444", fontSize: "14px", marginBottom: "16px" }}>{widgetState.errors.submit}</p>
        )}

        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <Button type="submit" fullWidth loading={widgetState.loading}>
            Continue →
          </Button>
        </div>
      </form>
    </WidgetWrapper>
  )
}

const root = createRoot(document.getElementById("root")!)
root.render(<BusinessInfoWidget />)
