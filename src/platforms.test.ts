import { describe, expect, it } from "vitest";
import { convertToXget, DEFAULT_XGET_BASE, normalizeInputUrl } from "./platforms";

describe("normalizeInputUrl", () => {
  it("returns empty string for blank input", () => {
    expect(normalizeInputUrl("   ")).toBe("");
  });

  it("auto prepends https for host only", () => {
    expect(normalizeInputUrl("github.com/owner/repo")).toBe("https://github.com/owner/repo");
  });

  it("keeps existing scheme", () => {
    expect(normalizeInputUrl("ftp://example.com/data"))
      .toBe("ftp://example.com/data");
  });

  it("handles protocol-relative URLs", () => {
    expect(normalizeInputUrl("//huggingface.co/model"))
      .toBe("https://huggingface.co/model");
  });
});

describe("convertToXget", () => {
  it("converts GitHub URLs without explicit scheme", () => {
    const result = convertToXget("github.com/xixu-me/Xget", DEFAULT_XGET_BASE);
    expect(result.ok).toBe(true);
    expect(result.output).toBe("https://xget.xi-xu.me/gh/xixu-me/Xget");
  });

  it("converts raw GitHub content hosts", () => {
    const result = convertToXget(
      "https://raw.githubusercontent.com/xixu-me/Xget/main/README.md",
      DEFAULT_XGET_BASE
    );
    expect(result.ok).toBe(true);
    expect(result?.platform?.id).toBe("github");
    expect(result.output).toBe(
      "https://xget.xi-xu.me/gh/xixu-me/Xget/main/README.md"
    );
  });

  it("normalizes conda community paths", () => {
    const result = convertToXget(
      "https://conda.anaconda.org/conda-forge/linux-64/repodata.json",
      DEFAULT_XGET_BASE
    );
    expect(result.ok).toBe(true);
    expect(result.output).toBe(
      "https://xget.xi-xu.me/conda/community/conda-forge/linux-64/repodata.json"
    );
  });

  it("flags unsupported platforms", () => {
    const result = convertToXget("https://example.com/resource", DEFAULT_XGET_BASE);
    expect(result.ok).toBe(false);
    expect(result.message).toBe("暂未匹配到支持的平台");
  });
});
