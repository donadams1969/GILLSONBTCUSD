import { test, expect } from "@playwright/test"

test("no hydration errors on homepage", async ({ page }) => {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })

  await page.goto("/")
  await page.waitForTimeout(2000)

  const joined = errors.join("\n")
  expect(joined).not.toContain("Hydration failed")
  expect(joined).not.toContain("did not match")
})

test("audit page loads without errors", async ({ page }) => {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })

  await page.goto("/audit")
  await page.waitForTimeout(1500)

  expect(errors.filter((e) => e.includes("Hydration"))).toHaveLength(0)
})

test("safety page loads without errors", async ({ page }) => {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })

  await page.goto("/safety")
  await page.waitForTimeout(1500)

  expect(errors.filter((e) => e.includes("Hydration"))).toHaveLength(0)
})

test("CSP header is present", async ({ page }) => {
  const response = await page.goto("/")
  const headers = response?.headers() ?? {}
  const hasCsp =
    !!headers["content-security-policy"] ||
    !!headers["content-security-policy-report-only"]
  expect(hasCsp).toBe(true)
})
