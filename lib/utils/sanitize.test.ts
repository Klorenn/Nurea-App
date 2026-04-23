import { describe, it, expect } from "vitest"
import { sanitizeText, sanitizeName, sanitizeEmail, sanitizeUrl } from "./sanitize"

describe("sanitize", () => {
  describe("sanitizeText", () => {
    it("removes HTML tags", () => {
      const input = "<script>alert('xss')</script>Hello"
      const result = sanitizeText(input)
      expect(result).not.toContain("<script>")
    })

    it("limits text length", () => {
      const input = "a".repeat(15000)
      const result = sanitizeText(input)
      expect(result.length).toBeLessThanOrEqual(10000)
    })

    it("handles empty string", () => {
      expect(sanitizeText("")).toBe("")
    })
  })

  describe("sanitizeName", () => {
    it("trims whitespace", () => {
      expect(sanitizeName("  John  ")).toBe("John")
    })

    it("removes special characters", () => {
      expect(sanitizeName("John@Doe!")).toBe("JohnDoe")
    })
  })

  describe("sanitizeEmail", () => {
    it("lowercases email", () => {
      expect(sanitizeEmail("JOHN@EXAMPLE.COM")).toBe("john@example.com")
    })

    it("trims whitespace", () => {
      expect(sanitizeEmail("  john@example.com  ")).toBe("john@example.com")
    })
  })

  describe("sanitizeUrl", () => {
    it("returns null for invalid URLs", () => {
      expect(sanitizeUrl("not-a-url")).toBe(null)
    })

    it("returns null for javascript URLs", () => {
      expect(sanitizeUrl("javascript:alert(1)")).toBe(null)
    })
  })
})
