"use client"

import type React from "react"
import { createRoot } from "react-dom/client"
import { WidgetWrapper, useWidgetState, useToolOutput } from "./components/widget-wrapper"
import { FormField } from "./components/form-field"
import { Button } from "./components/button"

interface ProcessingOutput {
  type: string
  step: number
  totalSteps: number
  message: string
}

function ProcessingDetailsWidget() {
  const output = useToolOutput<ProcessingOutput>()
  const [widgetState, setWidgetState] = useWidgetState({
    averageTicketSize: "",
    monthlyVolume: "",
    highestTicket: "",
    currentProcessor: "",
    businessDescription: "",
    salesMethod: "",
    industryType: "",
    acceptedCardTypes: ["visa", "mastercard", "amex", "discover"] as string[],
    loading: false,
    errors: {} as Record<string, string>,
  })

  const toggleCardType = (cardType: string) => {
    const current = widgetState.acceptedCardTypes
    const updated = current.includes(cardType) ? current.filter((c) => c !== cardType) : [...current, cardType]
    setWidgetState({ ...widgetState, acceptedCardTypes: updated })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors: Record<string, string> = {}
    if (!widgetState.averageTicketSize) errors.averageTicketSize = "Required"
    if (!widgetState.monthlyVolume) errors.monthlyVolume = "Required"
    if (!widgetState.businessDescription) errors.businessDescription = "Required"
    if (!widgetState.salesMethod) errors.salesMethod = "Required"

    if (Object.keys(errors).length > 0) {
      setWidgetState({ ...widgetState, errors })
      return
    }

    setWidgetState({ ...widgetState, loading: true, errors: {} })

    try {
      await window.openai.callTool("split_save_processing_details", {
        averageTicketSize: Number.parseFloat(widgetState.averageTicketSize),
        monthlyVolume: Number.parseFloat(widgetState.monthlyVolume),
        highestTicket: widgetState.highestTicket ? Number.parseFloat(widgetState.highestTicket) : undefined,
        currentProcessor: widgetState.currentProcessor || undefined,
        businessDescription: widgetState.businessDescription,
        salesMethod: widgetState.salesMethod,
        industryType: widgetState.industryType || undefined,
        acceptedCardTypes: widgetState.acceptedCardTypes,
      })
    } catch (err) {
      setWidgetState({
        ...widgetState,
        loading: false,
        errors: { submit: "Failed to save. Please try again." },
      })
    }
  }

  const cardTypes = [
    { id: "visa", name: "Visa", color: "#1a1f71" },
    { id: "mastercard", name: "Mastercard", color: "#eb001b" },
    { id: "amex", name: "American Express", color: "#006fcf" },
    { id: "discover", name: "Discover", color: "#ff6600" },
  ]

  return (
    <WidgetWrapper title="Processing Details" step={output?.step || 5} totalSteps={output?.totalSteps || 5}>
      <p style={{ marginBottom: "24px", color: "#666", fontSize: "15px" }}>
        {output?.message || "Tell us about your payment processing needs."}
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <FormField
            label="Average Transaction ($)"
            name="averageTicketSize"
            type="number"
            value={widgetState.averageTicketSize}
            onChange={(v) => setWidgetState({ ...widgetState, averageTicketSize: v })}
            placeholder="75"
            required
            error={widgetState.errors.averageTicketSize}
          />

          <FormField
            label="Monthly Volume ($)"
            name="monthlyVolume"
            type="number"
            value={widgetState.monthlyVolume}
            onChange={(v) => setWidgetState({ ...widgetState, monthlyVolume: v })}
            placeholder="10000"
            required
            error={widgetState.errors.monthlyVolume}
          />
        </div>

        <FormField
          label="Highest Expected Transaction ($)"
          name="highestTicket"
          type="number"
          value={widgetState.highestTicket}
          onChange={(v) => setWidgetState({ ...widgetState, highestTicket: v })}
          placeholder="500"
          helperText="Optional"
        />

        <FormField
          label="Current Processor"
          name="currentProcessor"
          value={widgetState.currentProcessor}
          onChange={(v) => setWidgetState({ ...widgetState, currentProcessor: v })}
          placeholder="Square, Stripe, PayPal, etc."
          helperText="Leave blank if this is your first processor"
        />

        <FormField
          label="Sales Method"
          name="salesMethod"
          type="select"
          value={widgetState.salesMethod}
          onChange={(v) => setWidgetState({ ...widgetState, salesMethod: v })}
          required
          error={widgetState.errors.salesMethod}
          options={[
            { value: "in_person", label: "In-Person (Retail/Restaurant)" },
            { value: "online", label: "Online (E-Commerce)" },
            { value: "both", label: "Both In-Person and Online" },
          ]}
        />

        <FormField
          label="Industry Type"
          name="industryType"
          value={widgetState.industryType}
          onChange={(v) => setWidgetState({ ...widgetState, industryType: v })}
          placeholder="Restaurant, Retail, Services, etc."
        />

        <FormField
          label="Business Description"
          name="businessDescription"
          type="textarea"
          value={widgetState.businessDescription}
          onChange={(v) => setWidgetState({ ...widgetState, businessDescription: v })}
          placeholder="Briefly describe the products or services you sell..."
          required
          error={widgetState.errors.businessDescription}
        />

        <div style={{ marginTop: "16px", marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }}>
            Accepted Card Types
          </label>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {cardTypes.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => toggleCardType(card.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: widgetState.acceptedCardTypes.includes(card.id)
                    ? `2px solid ${card.color}`
                    : "2px solid #ddd",
                  backgroundColor: widgetState.acceptedCardTypes.includes(card.id) ? `${card.color}10` : "transparent",
                  color: widgetState.acceptedCardTypes.includes(card.id) ? card.color : "#666",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
              >
                {card.name}
              </button>
            ))}
          </div>
        </div>

        {widgetState.errors.submit && (
          <p style={{ color: "#ef4444", fontSize: "14px", marginBottom: "16px" }}>{widgetState.errors.submit}</p>
        )}

        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <Button type="submit" fullWidth loading={widgetState.loading}>
            Review Application →
          </Button>
        </div>
      </form>
    </WidgetWrapper>
  )
}

const root = createRoot(document.getElementById("root")!)
root.render(<ProcessingDetailsWidget />)
