export interface PlatformRule {
  id: string;
  name: string;
  prefix: string;
  hosts: string[];
  description: string;
  matcher?: (url: URL) => boolean;
  transformPath?: (url: URL) => string;
}

export interface ConvertResult {
  ok: boolean;
  input?: URL;
  platform?: PlatformRule;
  output?: string;
  message?: string;
}
