"use client"

import type React from "react"
import { createRoot } from "react-dom/client"
import { WidgetWrapper, useWidgetState, useToolOutput } from "./components/widget-wrapper"
import { FormField } from "./components/form-field"
import { Button } from "./components/button"

interface OwnerInfoOutput {
  type: string
  step: number
  totalSteps: number
  message: string
}

function OwnerInfoWidget() {
  const output = useToolOutput<OwnerInfoOutput>()
  const [widgetState, setWidgetState] = useWidgetState({
    firstName: "",
    lastName: "",
    ssn: "",
    dateOfBirth: "",
    ownershipPercentage: "",
    title: "",
    email: "",
    phoneNumber: "",
    loading: false,
    errors: {} as Record<string, string>,
  })

  const formatSSN = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 4)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors: Record<string, string> = {}
    if (!widgetState.firstName) errors.firstName = "Required"
    if (!widgetState.lastName) errors.lastName = "Required"
    if (widgetState.ssn.length !== 4) errors.ssn = "Enter last 4 digits"
    if (!widgetState.dateOfBirth) errors.dateOfBirth = "Required"
    if (!widgetState.ownershipPercentage) errors.ownershipPercentage = "Required"

    if (Object.keys(errors).length > 0) {
      setWidgetState({ ...widgetState, errors })
      return
    }

    setWidgetState({ ...widgetState, loading: true, errors: {} })

    try {
      await window.openai.callTool("split_save_owner_info", {
        firstName: widgetState.firstName,
        lastName: widgetState.lastName,
        ssn: widgetState.ssn,
        dateOfBirth: widgetState.dateOfBirth,
        ownershipPercentage: Number.parseInt(widgetState.ownershipPercentage),
        title: widgetState.title || undefined,
        email: widgetState.email || undefined,
        phoneNumber: widgetState.phoneNumber || undefined,
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
    <WidgetWrapper title="Owner Information" step={output?.step || 2} totalSteps={output?.totalSteps || 5}>
      <p style={{ marginBottom: "24px", color: "#666", fontSize: "15px" }}>
        {output?.message || "Please provide the primary owner's information."}
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <FormField
            label="First Name"
            name="firstName"
            value={widgetState.firstName}
            onChange={(v) => setWidgetState({ ...widgetState, firstName: v })}
            placeholder="John"
            required
            error={widgetState.errors.firstName}
          />

          <FormField
            label="Last Name"
            name="lastName"
            value={widgetState.lastName}
            onChange={(v) => setWidgetState({ ...widgetState, lastName: v })}
            placeholder="Smith"
            required
            error={widgetState.errors.lastName}
          />
        </div>

        <FormField
          label="SSN (Last 4 digits)"
          name="ssn"
          value={widgetState.ssn}
          onChange={(v) => setWidgetState({ ...widgetState, ssn: formatSSN(v) })}
          placeholder="••••"
          required
          error={widgetState.errors.ssn}
          helperText="For identity verification only"
          maxLength={4}
        />

        <FormField
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          value={widgetState.dateOfBirth}
          onChange={(v) => setWidgetState({ ...widgetState, dateOfBirth: v })}
          required
          error={widgetState.errors.dateOfBirth}
        />

        <FormField
          label="Ownership Percentage"
          name="ownershipPercentage"
          type="number"
          value={widgetState.ownershipPercentage}
          onChange={(v) => setWidgetState({ ...widgetState, ownershipPercentage: v })}
          placeholder="100"
          required
          error={widgetState.errors.ownershipPercentage}
          helperText="Percentage of business owned (0-100)"
        />

        <FormField
          label="Title / Role"
          name="title"
          value={widgetState.title}
          onChange={(v) => setWidgetState({ ...widgetState, title: v })}
          placeholder="Owner, CEO, President, etc."
        />

        <FormField
          label="Personal Email"
          name="email"
          type="email"
          value={widgetState.email}
          onChange={(v) => setWidgetState({ ...widgetState, email: v })}
          placeholder="john@example.com"
        />

        <FormField
          label="Personal Phone"
          name="phoneNumber"
          type="tel"
          value={widgetState.phoneNumber}
          onChange={(v) => setWidgetState({ ...widgetState, phoneNumber: v })}
          placeholder="(555) 123-4567"
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
root.render(<OwnerInfoWidget />)
