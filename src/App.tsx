import { useMemo, useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { convertToXget, DEFAULT_XGET_BASE, normalizeInputUrl } from "./platforms";
import { trackEvent } from "./analytics";

const configuredBase = (import.meta.env.VITE_XGET_BASE as string | undefined)?.trim();
const RESOLVED_BASE = configuredBase && configuredBase.length > 0 ? configuredBase : DEFAULT_XGET_BASE;

function App() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => convertToXget(sourceUrl, RESOLVED_BASE), [sourceUrl]);
  const hasError = Boolean(sourceUrl.trim() && !result.ok);

  const hintText = useMemo(() => {
    if (!sourceUrl.trim()) {
      return "";
    }
    if (result.ok && result.platform) {
      return `已检测到 ${result.platform.name}（前缀 ${result.platform.prefix}）`;
    }
    return result.message ?? "请确认 URL 是否正确";
  }, [result, sourceUrl]);

  const statusClass = `status ${hasError ? "status-warn" : "status-success"}`;

  const handleBlur = () => {
    const normalized = normalizeInputUrl(sourceUrl);
    if (normalized !== sourceUrl) {
      setSourceUrl(normalized);
    }
    if (!normalized) {
      return;
    }
    const evaluation = convertToXget(normalized, RESOLVED_BASE);
    if (evaluation.ok) {
      trackEvent("conversion_detected", { platform: evaluation.platform?.id });
    } else {
      trackEvent("conversion_failed", { reason: evaluation.message ?? "unknown" });
    }
  };

  const handleCopy = async () => {
    if (!result.ok || !result.output) {
      return;
    }
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      trackEvent("copy_success", { platform: result.platform?.id, inputHost: result.input?.hostname });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("复制失败", error);
      trackEvent("copy_failed", { message: (error as Error).message });
      setCopied(false);
    }
  };

  return (
    <div className="page">
      <section className="card">
        <header className="card-header">
          <h1>Xget URL 转换器</h1>
          <p>输入原始地址，立即获得 Xget 加速格式。</p>
        </header>

        <div className="input-group">
          <label htmlFor="source" className="label">
            原始 URL
          </label>
          <div className="input-wrapper">
            <Link2 className="input-icon" size={18} />
            <input
              id="source"
              className={`input ${hasError ? "input-error" : ""}`}
              value={sourceUrl}
              placeholder="https://github.com/owner/repo"
              onChange={(event) => setSourceUrl(event.target.value)}
              onBlur={handleBlur}
              aria-invalid={hasError}
              aria-describedby="source-status"
            />
          </div>
          {hintText ? (
            <div className={statusClass} id="source-status" role={hasError ? "alert" : "status"}>
              <span className={hasError ? "dot dot-warn" : "dot dot-success"} />
              <span>{hintText}</span>
            </div>
          ) : null}
        </div>

        <div className="input-group">
          <label htmlFor="output" className="label">
            转换后的 Xget URL
          </label>
          <div className="output-row">
            <input
              id="output"
              className="input output"
              value={result.output ?? ""}
              readOnly
              placeholder="转换结果将显示在这里"
            />
            <button
              type="button"
              className="copy-btn"
              onClick={handleCopy}
              disabled={!result.ok}
              aria-label="复制转换后的 URL"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? "已复制" : "复制"}
            </button>
          </div>
          <p className="hint">转换时会自动使用后台配置的 Xget 实例域名。</p>
        </div>
      </section>
    </div>
  );
}

export default App;
