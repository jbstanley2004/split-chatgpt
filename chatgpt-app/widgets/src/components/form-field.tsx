"use client"

import type React from "react"
import { useTheme } from "./widget-wrapper"

interface FormFieldProps {
  label: string
  name: string
  type?: "text" | "email" | "password" | "tel" | "number" | "date" | "select" | "textarea"
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  error?: string
  helperText?: string
  disabled?: boolean
  pattern?: string
  maxLength?: number
}

export function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  options,
  error,
  helperText,
  disabled,
  pattern,
  maxLength,
}: FormFieldProps) {
  const theme = useTheme()

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    fontSize: "16px",
    border: `1px solid ${error ? "#ef4444" : theme === "dark" ? "#444" : "#ddd"}`,
    borderRadius: "8px",
    backgroundColor: theme === "dark" ? "#2a2a2a" : "#fff",
    color: theme === "dark" ? "#fff" : "#1a1a1a",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  }

  return (
    <div style={{ marginBottom: "16px" }}>
      <label
        htmlFor={name}
        style={{
          display: "block",
          marginBottom: "6px",
          fontSize: "14px",
          fontWeight: 500,
          color: theme === "dark" ? "#ccc" : "#444",
        }}
      >
        {label}
        {required && <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>}
      </label>

      {type === "select" ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
          disabled={disabled}
          required={required}
        >
          <option value="">Select...</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
          disabled={disabled}
          required={required}
          pattern={pattern}
          maxLength={maxLength}
        />
      )}

      {(error || helperText) && (
        <p
          style={{
            marginTop: "4px",
            fontSize: "12px",
            color: error ? "#ef4444" : theme === "dark" ? "#888" : "#666",
          }}
        >
          {error || helperText}
        </p>
      )}
    </div>
  )
}

export default FormField
