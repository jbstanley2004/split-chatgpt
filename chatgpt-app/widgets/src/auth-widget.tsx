"use client"

import type React from "react"
import { createRoot } from "react-dom/client"
import { WidgetWrapper, useWidgetState, useToolOutput } from "./components/widget-wrapper"
import { FormField } from "./components/form-field"
import { Button } from "./components/button"

interface AuthOutput {
  type: string
  isAuthenticated: boolean
  message: string
}

function AuthWidget() {
  const output = useToolOutput<AuthOutput>()
  const [widgetState, setWidgetState] = useWidgetState({
    mode: "signin" as "signin" | "signup",
    email: "",
    password: "",
    name: "",
    loading: false,
    error: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setWidgetState({ ...widgetState, loading: true, error: "" })

    try {
      await window.openai.callTool("split_authenticate", {
        email: widgetState.email,
        password: widgetState.password,
        isSignUp: widgetState.mode === "signup",
        name: widgetState.name,
      })
    } catch (err) {
      setWidgetState({
        ...widgetState,
        loading: false,
        error: "Authentication failed. Please try again.",
      })
    }
  }

  const handleGoogleSignIn = () => {
    window.openai.openExternal({
      href: "https://split-clean.vercel.app/api/auth/google",
    })
  }

  return (
    <WidgetWrapper title="Welcome to Split">
      <p
        style={{
          marginBottom: "24px",
          color: "#666",
          fontSize: "15px",
        }}
      >
        {output?.message || "Sign in or create an account to begin your merchant application."}
      </p>

      {/* Google Sign In */}
      <Button variant="outline" fullWidth onClick={handleGoogleSignIn}>
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          margin: "24px 0",
          gap: "16px",
        }}
      >
        <div style={{ flex: 1, height: "1px", backgroundColor: "#ddd" }} />
        <span style={{ color: "#888", fontSize: "13px", textTransform: "uppercase" }}>Or continue with email</span>
        <div style={{ flex: 1, height: "1px", backgroundColor: "#ddd" }} />
      </div>

      <form onSubmit={handleSubmit}>
        {widgetState.mode === "signup" && (
          <FormField
            label="Full Name"
            name="name"
            value={widgetState.name}
            onChange={(v) => setWidgetState({ ...widgetState, name: v })}
            placeholder="John Smith"
            required
          />
        )}

        <FormField
          label="Email Address"
          name="email"
          type="email"
          value={widgetState.email}
          onChange={(v) => setWidgetState({ ...widgetState, email: v })}
          placeholder="name@company.com"
          required
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          value={widgetState.password}
          onChange={(v) => setWidgetState({ ...widgetState, password: v })}
          placeholder="••••••••"
          required
        />

        {widgetState.error && (
          <p style={{ color: "#ef4444", fontSize: "14px", marginBottom: "16px" }}>{widgetState.error}</p>
        )}

        <Button type="submit" fullWidth loading={widgetState.loading}>
          {widgetState.mode === "signup" ? "Create Account" : "Sign In"} →
        </Button>
      </form>

      <p
        style={{
          marginTop: "20px",
          textAlign: "center",
          fontSize: "14px",
          color: "#666",
        }}
      >
        {widgetState.mode === "signin" ? (
          <>
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => setWidgetState({ ...widgetState, mode: "signup" })}
              style={{
                background: "none",
                border: "none",
                color: "#1a1a1a",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setWidgetState({ ...widgetState, mode: "signin" })}
              style={{
                background: "none",
                border: "none",
                color: "#1a1a1a",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </WidgetWrapper>
  )
}

// Mount
const root = createRoot(document.getElementById("root")!)
root.render(<AuthWidget />)
