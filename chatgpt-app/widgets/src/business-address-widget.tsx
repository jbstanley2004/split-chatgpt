"use client"

import type React from "react"
import { createRoot } from "react-dom/client"
import { WidgetWrapper, useWidgetState, useToolOutput } from "./components/widget-wrapper"
import { FormField } from "./components/form-field"
import { Button } from "./components/button"

interface AddressOutput {
  type: string
  step: number
  totalSteps: number
  message: string
}

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
]

function BusinessAddressWidget() {
  const output = useToolOutput<AddressOutput>()
  const [widgetState, setWidgetState] = useWidgetState({
    streetAddress: "",
    streetAddress2: "",
    city: "",
    state: "",
    zipCode: "",
    mailingAddressSame: true,
    mailingStreetAddress: "",
    mailingCity: "",
    mailingState: "",
    mailingZipCode: "",
    loading: false,
    errors: {} as Record<string, string>,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors: Record<string, string> = {}
    if (!widgetState.streetAddress) errors.streetAddress = "Required"
    if (!widgetState.city) errors.city = "Required"
    if (!widgetState.state) errors.state = "Required"
    if (!widgetState.zipCode || widgetState.zipCode.length < 5) errors.zipCode = "Invalid ZIP"

    if (Object.keys(errors).length > 0) {
      setWidgetState({ ...widgetState, errors })
      return
    }

    setWidgetState({ ...widgetState, loading: true, errors: {} })

    try {
      await window.openai.callTool("split_save_business_address", {
        streetAddress: widgetState.streetAddress,
        streetAddress2: widgetState.streetAddress2 || undefined,
        city: widgetState.city,
        state: widgetState.state,
        zipCode: widgetState.zipCode,
        country: "US",
        mailingAddressSame: widgetState.mailingAddressSame,
        mailingStreetAddress: !widgetState.mailingAddressSame ? widgetState.mailingStreetAddress : undefined,
        mailingCity: !widgetState.mailingAddressSame ? widgetState.mailingCity : undefined,
        mailingState: !widgetState.mailingAddressSame ? widgetState.mailingState : undefined,
        mailingZipCode: !widgetState.mailingAddressSame ? widgetState.mailingZipCode : undefined,
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
    <WidgetWrapper title="Business Address" step={output?.step || 3} totalSteps={output?.totalSteps || 5}>
      <p style={{ marginBottom: "24px", color: "#666", fontSize: "15px" }}>
        {output?.message || "Please provide your business location."}
      </p>

      <form onSubmit={handleSubmit}>
        <FormField
          label="Street Address"
          name="streetAddress"
          value={widgetState.streetAddress}
          onChange={(v) => setWidgetState({ ...widgetState, streetAddress: v })}
          placeholder="123 Main Street"
          required
          error={widgetState.errors.streetAddress}
        />

        <FormField
          label="Apt, Suite, Unit (optional)"
          name="streetAddress2"
          value={widgetState.streetAddress2}
          onChange={(v) => setWidgetState({ ...widgetState, streetAddress2: v })}
          placeholder="Suite 100"
        />

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "16px" }}>
          <FormField
            label="City"
            name="city"
            value={widgetState.city}
            onChange={(v) => setWidgetState({ ...widgetState, city: v })}
            placeholder="Los Angeles"
            required
            error={widgetState.errors.city}
          />

          <FormField
            label="State"
            name="state"
            type="select"
            value={widgetState.state}
            onChange={(v) => setWidgetState({ ...widgetState, state: v })}
            required
            error={widgetState.errors.state}
            options={US_STATES}
          />

          <FormField
            label="ZIP Code"
            name="zipCode"
            value={widgetState.zipCode}
            onChange={(v) => setWidgetState({ ...widgetState, zipCode: v.replace(/\D/g, "").slice(0, 5) })}
            placeholder="90210"
            required
            error={widgetState.errors.zipCode}
          />
        </div>

        <div style={{ marginTop: "20px", marginBottom: "16px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={widgetState.mailingAddressSame}
              onChange={(e) => setWidgetState({ ...widgetState, mailingAddressSame: e.target.checked })}
              style={{ width: "18px", height: "18px" }}
            />
            <span style={{ fontSize: "14px" }}>Mailing address is the same as business address</span>
          </label>
        </div>

        {!widgetState.mailingAddressSame && (
          <div style={{ padding: "16px", backgroundColor: "#f9f9f9", borderRadius: "8px", marginBottom: "16px" }}>
            <h4 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: 600 }}>Mailing Address</h4>

            <FormField
              label="Street Address"
              name="mailingStreetAddress"
              value={widgetState.mailingStreetAddress}
              onChange={(v) => setWidgetState({ ...widgetState, mailingStreetAddress: v })}
              placeholder="PO Box 123"
            />

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "16px" }}>
              <FormField
                label="City"
                name="mailingCity"
                value={widgetState.mailingCity}
                onChange={(v) => setWidgetState({ ...widgetState, mailingCity: v })}
              />

              <FormField
                label="State"
                name="mailingState"
                type="select"
                value={widgetState.mailingState}
                onChange={(v) => setWidgetState({ ...widgetState, mailingState: v })}
                options={US_STATES}
              />

              <FormField
                label="ZIP"
                name="mailingZipCode"
                value={widgetState.mailingZipCode}
                onChange={(v) => setWidgetState({ ...widgetState, mailingZipCode: v })}
              />
            </div>
          </div>
        )}

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
root.render(<BusinessAddressWidget />)
