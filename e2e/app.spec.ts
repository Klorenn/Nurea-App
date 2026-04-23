import { test, expect } from "@playwright/test"

test.describe("Homepage", () => {
  test("should load the homepage", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/NUREA/i)
  })

  test("should show hero section", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("text=Encuentra")).toBeVisible()
  })

  test("should have working navigation", async ({ page }) => {
    await page.goto("/")
    await page.click("text=Iniciar Sesión")
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Login", () => {
  test("should show login form", async ({ page }) => {
    await page.goto("/login")
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test("should show validation errors for empty form", async ({ page }) => {
    await page.goto("/login")
    await page.click('button[type="submit"]')
    await expect(page.locator("text=Email es requerido")).toBeVisible()
  })
})

test.describe("Signup", () => {
  test("should show signup form", async ({ page }) => {
    await page.goto("/signup")
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test("should navigate to login from signup", async ({ page }) => {
    await page.goto("/signup")
    await page.click("text=¿Ya tienes cuenta?")
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Search", () => {
  test("should load search page", async ({ page }) => {
    await page.goto("/search")
    await expect(page.locator('input[placeholder*="buscar" i], input[placeholder*="specialist" i]')).toBeVisible()
  })
})
