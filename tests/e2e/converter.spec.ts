import { test, expect } from "@playwright/test";

const SAMPLE_URL = "https://github.com/xixu-me/Xget";

test.describe("Xget URL 转换器", () => {
  test("converts GitHub URL 并可复制", async ({ page }) => {
    await page.goto("/");

    const sourceInput = page.getByLabel("原始 URL");
    await sourceInput.fill(SAMPLE_URL);
    await sourceInput.blur();

    const outputInput = page.getByLabel("转换后的 Xget URL");
    await expect(outputInput).toHaveValue(/xget/);

    const copyButton = page.getByRole("button", { name: "复制转换后的 URL" });
    await copyButton.click();
    await expect(copyButton).toContainText(/复制/);
  });
});
