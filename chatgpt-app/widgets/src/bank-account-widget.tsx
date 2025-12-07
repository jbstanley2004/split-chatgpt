"use client"

import type React from "react"
import { createRoot } from "react-dom/client"
import { WidgetWrapper, useWidgetState, useToolOutput } from "./components/widget-wrapper"
import { FormField } from "./components/form-field"
import { Button } from "./components/button"

interface BankAccountOutput {
  type: string
  step: number
  totalSteps: number
  message: string
}

function BankAccountWidget() {
  const output = useToolOutput<BankAccountOutput>()
  const [widgetState, setWidgetState] = useWidgetState({
    bankName: "",
    accountType: "",
    routingNumber: "",
    accountNumber: "",
    confirmAccountNumber: "",
    accountHolderName: "",
    loading: false,
    errors: {} as Record<string, string>,
  })

  const formatRoutingNumber = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 9)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors: Record<string, string> = {}
    if (!widgetState.bankName) errors.bankName = "Required"
    if (!widgetState.accountType) errors.accountType = "Required"
    if (widgetState.routingNumber.length !== 9) errors.routingNumber = "Must be 9 digits"
    if (!widgetState.accountNumber) errors.accountNumber = "Required"
    if (widgetState.accountNumber !== widgetState.confirmAccountNumber) {
      errors.confirmAccountNumber = "Account numbers don't match"
    }
    if (!widgetState.accountHolderName) errors.accountHolderName = "Required"

    if (Object.keys(errors).length > 0) {
      setWidgetState({ ...widgetState, errors })
      return
    }

    setWidgetState({ ...widgetState, loading: true, errors: {} })

    try {
      await window.openai.callTool("split_save_bank_account", {
        bankName: widgetState.bankName,
        accountType: widgetState.accountType,
        routingNumber: widgetState.routingNumber,
        accountNumber: widgetState.accountNumber,
        accountHolderName: widgetState.accountHolderName,
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
    <WidgetWrapper title="Bank Account" step={output?.step || 4} totalSteps={output?.totalSteps || 5}>
      <p style={{ marginBottom: "24px", color: "#666", fontSize: "15px" }}>
        {output?.message || "Where should we deposit your funds?"}
      </p>

      <div
        style={{
          padding: "16px",
          backgroundColor: "#fef3c7",
          borderRadius: "8px",
          marginBottom: "24px",
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div style={{ flex: 1, fontSize: "14px", color: "#92400e" }}>
          <strong>Security Notice:</strong> Your bank information is encrypted and securely stored. We use it only for
          depositing your funds.
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <FormField
          label="Bank Name"
          name="bankName"
          value={widgetState.bankName}
          onChange={(v) => setWidgetState({ ...widgetState, bankName: v })}
          placeholder="Chase, Bank of America, Wells Fargo, etc."
          required
          error={widgetState.errors.bankName}
        />

        <FormField
          label="Account Type"
          name="accountType"
          type="select"
          value={widgetState.accountType}
          onChange={(v) => setWidgetState({ ...widgetState, accountType: v })}
          required
          error={widgetState.errors.accountType}
          options={[
            { value: "checking", label: "Checking" },
            { value: "savings", label: "Savings" },
          ]}
        />

        <FormField
          label="Routing Number"
          name="routingNumber"
          value={widgetState.routingNumber}
          onChange={(v) => setWidgetState({ ...widgetState, routingNumber: formatRoutingNumber(v) })}
          placeholder="9 digits"
          required
          error={widgetState.errors.routingNumber}
          helperText="Find this on the bottom left of your check"
        />

        <FormField
          label="Account Number"
          name="accountNumber"
          value={widgetState.accountNumber}
          onChange={(v) => setWidgetState({ ...widgetState, accountNumber: v.replace(/\D/g, "") })}
          placeholder="Your bank account number"
          required
          error={widgetState.errors.accountNumber}
        />

        <FormField
          label="Confirm Account Number"
          name="confirmAccountNumber"
          value={widgetState.confirmAccountNumber}
          onChange={(v) => setWidgetState({ ...widgetState, confirmAccountNumber: v.replace(/\D/g, "") })}
          placeholder="Re-enter account number"
          required
          error={widgetState.errors.confirmAccountNumber}
        />

        <FormField
          label="Account Holder Name"
          name="accountHolderName"
          value={widgetState.accountHolderName}
          onChange={(v) => setWidgetState({ ...widgetState, accountHolderName: v })}
          placeholder="Name on the account"
          required
          error={widgetState.errors.accountHolderName}
          helperText="Must match the name on your bank account"
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
root.render(<BankAccountWidget />)
