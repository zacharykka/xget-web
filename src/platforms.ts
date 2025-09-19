import type { ConvertResult, PlatformRule } from "./platformTypes";
import { createPlatformRules } from "./platformCatalog";

export type { PlatformRule, ConvertResult } from "./platformTypes";

export const DEFAULT_XGET_BASE = "https://xget.xi-xu.me";

const SCHEME_REGEX = /^[a-zA-Z][a-zA-Z\d+.-]*:/;
const FAILURE_MESSAGE_UNSUPPORTED = "暂未匹配到支持的平台";

let platformRulesCache: PlatformRule[] | null = null;

function getPlatformRules(): PlatformRule[] {
  if (!platformRulesCache) {
    platformRulesCache = createPlatformRules();
  }
  return platformRulesCache;
}

export function listSupportedPlatforms(): PlatformRule[] {
  return getPlatformRules().map((rule) => ({ ...rule }));
}

export function normalizeInputUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (SCHEME_REGEX.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function matchPlatform(url: URL): PlatformRule | undefined {
  const rules = getPlatformRules();
  return rules.find((rule) => {
    const hostMatched = rule.hosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
    if (!hostMatched) {
      return false;
    }
    return rule.matcher ? rule.matcher(url) : true;
  });
}

export function convertToXget(rawUrl: string, base = DEFAULT_XGET_BASE): ConvertResult {
  const normalizedInput = normalizeInputUrl(rawUrl);
  if (!normalizedInput) {
    return { ok: false, message: "" };
  }

  let parsed: URL;
  try {
    parsed = new URL(normalizedInput);
  } catch (error) {
    return { ok: false, message: "URL 格式不合法，请确保包含 http(s)://" };
  }

  const matched = matchPlatform(parsed);

  if (!matched) {
    return { ok: false, input: parsed, message: FAILURE_MESSAGE_UNSUPPORTED };
  }

  const normalizedBase = base.replace(/\/$/, "");
  const pathProvider = matched.transformPath ?? ((url: URL) => url.pathname.replace(/^\//, ""));
  const convertedPath = pathProvider(parsed);
  const search = parsed.search ?? "";
  const hash = parsed.hash ?? "";
  const output = `${normalizedBase}/${matched.prefix}/${convertedPath}${search}${hash}`;

  return {
    ok: true,
    input: parsed,
    platform: matched,
    output
  };
}
