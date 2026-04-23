import { describe, it, expect } from "vitest"
import {
  formatShortDate,
  getDayName,
  getShortDayName,
  isValidTime,
  isFutureDate,
  getTodayISO,
} from "./date-helpers"

describe("date-helpers", () => {
  describe("formatShortDate", () => {
    it("formats date object in Spanish", () => {
      const date = new Date("2026-01-15T12:00:00Z")
      const result = formatShortDate(date, "es")
      expect(result).toMatch(/^(Ene|15)/)
    })

    it("formats date object in English", () => {
      const date = new Date("2026-01-15T12:00:00Z")
      const result = formatShortDate(date, "en")
      expect(result).toMatch(/^(Jan|15)/)
    })

    it("handles string input", () => {
      const result = formatShortDate("2026-01-15", "es")
      expect(result).toMatch(/Ene/)
    })
  })

  describe("getDayName", () => {
    it("returns a day name string", () => {
      const date = new Date()
      const result = getDayName(date, "es")
      expect(typeof result).toBe("string")
      expect(result.length).toBeGreaterThan(0)
    })

    it("returns different results for different languages", () => {
      const date = new Date()
      const es = getDayName(date, "es")
      const en = getDayName(date, "en")
      expect(es).not.toBe(en)
    })
  })

  describe("getShortDayName", () => {
    it("returns a short day name", () => {
      const date = new Date()
      const result = getShortDayName(date, "es")
      expect(typeof result).toBe("string")
      expect(result.length).toBeLessThanOrEqual(4)
    })
  })

  describe("isValidTime", () => {
    it("validates correct time format HH:MM", () => {
      expect(isValidTime("09:00")).toBe(true)
      expect(isValidTime("23:59")).toBe(true)
      expect(isValidTime("00:00")).toBe(true)
      expect(isValidTime("12:30")).toBe(true)
    })

    it("rejects invalid time format", () => {
      expect(isValidTime("25:00")).toBe(false)
      expect(isValidTime("9:00")).toBe(false)
      expect(isValidTime("09:60")).toBe(false)
      expect(isValidTime("invalid")).toBe(false)
      expect(isValidTime("")).toBe(false)
    })
  })

  describe("isFutureDate", () => {
    it("returns true for dates far in future", () => {
      const future = new Date()
      future.setFullYear(future.getFullYear() + 1)
      const futureStr = future.toISOString().split("T")[0]
      expect(isFutureDate(futureStr)).toBe(true)
    })

    it("returns boolean for any date", () => {
      const today = getTodayISO()
      const past = "2020-01-01"
      const future = new Date()
      future.setFullYear(future.getFullYear() + 1)
      const futureStr = future.toISOString().split("T")[0]
      
      expect(typeof isFutureDate(today)).toBe("boolean")
      expect(typeof isFutureDate(past)).toBe("boolean")
      expect(typeof isFutureDate(futureStr)).toBe("boolean")
    })
  })

  describe("getTodayISO", () => {
    it("returns date in YYYY-MM-DD format", () => {
      const today = getTodayISO()
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it("returns a valid date string", () => {
      const today = getTodayISO()
      const date = new Date(today)
      expect(date.getTime()).not.toBeNaN()
    })
  })
})
