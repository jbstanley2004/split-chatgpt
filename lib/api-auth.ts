export function validateApiKey(request: Request): boolean {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return false
  }

  const providedKey = authHeader.slice(7)
  const validKey = process.env.SPLIT_API_KEY

  if (!validKey) {
    console.error("SPLIT_API_KEY not configured")
    return false
  }

  // Constant-time comparison to prevent timing attacks
  if (providedKey.length !== validKey.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < providedKey.length; i++) {
    result |= providedKey.charCodeAt(i) ^ validKey.charCodeAt(i)
  }

  return result === 0
}
