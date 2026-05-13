import { expect, test } from "@playwright/test";

test("dashboard renders key intelligence widgets", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page.getByText("Global Dashboard")).toBeVisible();
  await expect(page.getByText("Total Portfolio Value")).toBeVisible();
  await expect(page.getByText("Risk Exposure")).toBeVisible();
});
