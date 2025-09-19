export interface PlatformRule {
  id: string;
  name: string;
  prefix: string;
  hosts: string[];
  description: string;
  matcher?: (url: URL) => boolean;
  transformPath?: (url: URL) => string;
}

export const DEFAULT_XGET_BASE = "https://xget.xi-xu.me";

const SCHEME_REGEX = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

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

type HostList = string[];

const GITHUB_HOSTS: HostList = [
  "github.com",
  "gist.github.com",
  "raw.githubusercontent.com",
  "codeload.github.com",
  "objects.githubusercontent.com",
  "media.githubusercontent.com",
  "githubusercontent.com"
];

const HUGGING_FACE_HOSTS: HostList = [
  "huggingface.co",
  "cdn-lfs.huggingface.co"
];

const CIVITAI_HOSTS: HostList = [
  "civitai.com",
  "cdn.civitai.com"
];

const CONTAINER_HOSTS: HostList = [
  "ghcr.io",
  "registry.k8s.io",
  "k8s.gcr.io",
  "gcr.io",
  "index.docker.io",
  "registry-1.docker.io",
  "docker.io",
  "quay.io",
  "mcr.microsoft.com",
  "public.ecr.aws"
];

export const PLATFORM_RULES: PlatformRule[] = [
  {
    id: "homebrew",
    name: "Homebrew",
    prefix: "homebrew",
    hosts: ["github.com"],
    description: "Homebrew 项目专用镜像",
    matcher: (url) => url.pathname.toLowerCase().startsWith("/homebrew/"),
    transformPath: (url) => url.pathname.replace(/^\//, "")
  },
  {
    id: "github",
    name: "GitHub",
    prefix: "gh",
    hosts: GITHUB_HOSTS,
    description: "GitHub 仓库、发行版与 Gist 全量支持",
    transformPath: (url) => url.pathname.replace(/^\//, "")
  },
  {
    id: "gitlab",
    name: "GitLab",
    prefix: "gl",
    hosts: ["gitlab.com", "gitlab-static.net"],
    description: "GitLab SaaS 站点资源",
    transformPath: (url) => url.pathname.replace(/^\//, "")
  },
  {
    id: "gitea",
    name: "Gitea",
    prefix: "gitea",
    hosts: ["gitea.com"],
    description: "Gitea 官方托管平台",
    transformPath: (url) => url.pathname.replace(/^\//, "")
  },
  {
    id: "codeberg",
    name: "Codeberg",
    prefix: "codeberg",
    hosts: ["codeberg.org"],
    description: "Codeberg 仓库与附件",
    transformPath: (url) => url.pathname.replace(/^\//, "")
  },
  {
    id: "sourceforge",
    name: "SourceForge",
    prefix: "sf",
    hosts: ["sourceforge.net", "downloads.sourceforge.net", "downloads.sf.net"],
    description: "SourceForge 项目下载",
    transformPath: (url) => url.pathname.replace(/^\//, "")
  },
  {
    id: "aosp",
    name: "AOSP",
    prefix: "aosp",
    hosts: ["android.googlesource.com"],
    description: "AOSP Git 仓库",
    transformPath: (url) => url.pathname.replace(/^\//, "")
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    prefix: "hf",
    hosts: HUGGING_FACE_HOSTS,
    description: "模型、数据集与推理接口",
    transformPath: (url) => url.pathname.replace(/^\//, "")
  },
  {
    id: "civitai",
    name: "Civitai",
    prefix: "civitai",
    hosts: CIVITAI_HOSTS,
    description: "AI 模型市场",
    transformPath: (url) => url.pathname.replace(/^\//, "")
  },
  {
    id: "npm",
    name: "npm",
    prefix: "npm",
    hosts: ["registry.npmjs.org", "registry.yarnpkg.com"],
    description: "npm 官方注册表",
    transformPath: (url) => url.pathname.replace(/^\//, "")
  },
  {
    id: "pypi",
    name: "PyPI",
    prefix: "pypi",
    hosts: ["pypi.org", "files.pythonhosted.org"],
    description: "Python 包管理",
    transformPath: (url) => url.pathname.replace(/^\//, "")
  },
  {
    id: "conda",
    name: "conda",
    prefix: "conda",
    hosts: ["repo.anaconda.com", "conda.anaconda.org"],
    description: "Anaconda 官方与社区源",
    transformPath: (url) => {
      const pathname = url.pathname.replace(/^\//, "");
      if (url.hostname === "conda.anaconda.org") {
        return `community/${pathname}`;
      }
      return pathname;
    }
  },
  {
    id: "maven",
    name: "Maven Central",
    prefix: "maven",
    hosts: ["repo1.maven.org", "repo.maven.apache.org"],
    description: "Maven Central 仓库",
    transformPath: (url) => url.pathname.replace(/^\//, "")
  },
  {
    id: "apache",
    name: "Apache Downloads",
    prefix: "apache",
    hosts: ["downloads.apache.org", "archive.apache.org"],
    description: "Apache 官方下载镜像",
    transformPath: (url) => url.pathname.replace(/^\//, "")
  },
  {
    id: "gradle",
    name: "Gradle",
    prefix: "gradle",
    hosts: ["plugins.gradle.org", "services.gradle.org"],
    description: "Gradle 插件门户",
    transformPath: (url) => url.pathname.replace(/^\//, "")
  },
  {
    id: "rubygems",
    name: "RubyGems",
    prefix: "rubygems",
    hosts: ["rubygems.org"],
    description: "RubyGems 包与 API",
    transformPath: (url) => url.pathname.replace(/^\//, "")
  },
  {
    id: "cran",
    name: "CRAN",
    prefix: "cran",
    hosts: ["cran.r-project.org"],
    description: "CRAN 镜像",
    transformPath: (url) => url.pathname.replace(/^\//, "")
  },
  {
    id: "cpan",
    name: "CPAN",
    prefix: "cpan",
    hosts: ["www.cpan.org", "cpan.metacpan.org"],
    description: "Perl 模块镜像",
    transformPath: (url) => url.pathname.replace(/^\//, "")
  },
  {
    id: "nuget",
    name: "NuGet",
    prefix: "nuget",
    hosts: ["api.nuget.org"],
    description: "NuGet 包管理",
    transformPath: (url) => url.pathname.replace(/^\//, "")
  },
  {
    id: "crates",
    name: "Rust Crates",
    prefix: "crates",
    hosts: ["crates.io", "static.crates.io"],
    description: "Rust 包管理",
    transformPath: (url) => url.pathname.replace(/^\//, "")
  },
  {
    id: "container",
    name: "容器注册表",
    prefix: "cr",
    hosts: CONTAINER_HOSTS,
    description: "常见容器镜像仓库",
    transformPath: (url) => url.pathname.replace(/^\//, "")
  },
  {
    id: "ai-provider",
    name: "AI 推理提供商",
    prefix: "ip",
    hosts: [
      "api.openai.com",
      "api.anthropic.com",
      "generativelanguage.googleapis.com",
      "api.mistral.ai",
      "api.cohere.ai",
      "api.groq.com"
    ],
    description: "AI 推理 API 入口",
    transformPath: (url) => url.pathname.replace(/^\//, "")
  }
];

export interface ConvertResult {
  ok: boolean;
  input?: URL;
  platform?: PlatformRule;
  output?: string;
  message?: string;
}

// 将原始URL转换为Xget加速URL
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

  const matched = PLATFORM_RULES.find((rule) => {
    const hostMatched = rule.hosts.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`));
    if (!hostMatched) {
      return false;
    }
    return rule.matcher ? rule.matcher(parsed) : true;
  });

  if (!matched) {
    return { ok: false, input: parsed, message: "暂未匹配到支持的平台" };
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
