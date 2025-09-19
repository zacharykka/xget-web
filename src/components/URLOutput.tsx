import { memo } from "react";
import { Check, Copy } from "lucide-react";

export interface URLOutputProps {
  value: string;
  canCopy: boolean;
  onCopy: () => void;
  copied: boolean;
  isCopyPending: boolean;
  hint?: string;
}

export const URLOutput = memo(function URLOutput({
  value,
  canCopy,
  onCopy,
  copied,
  isCopyPending,
  hint = "转换时会自动使用后台配置的 Xget 实例域名。"
}: URLOutputProps) {
  const disabled = !canCopy || isCopyPending;
  const icon = copied ? <Check size={18} /> : <Copy size={18} />;
  const label = copied ? "已复制" : isCopyPending ? "复制中..." : "复制";

  return (
    <div className="input-group">
      <label htmlFor="output" className="label">
        转换后的 Xget URL
      </label>
      <div className="output-row">
        <input id="output" className="input output" value={value} readOnly placeholder="转换结果将显示在这里" />
        <button
          type="button"
          className="copy-btn"
          onClick={onCopy}
          disabled={disabled}
          aria-label="复制转换后的 URL"
        >
          {icon} {label}
        </button>
      </div>
      <p className="hint">{hint}</p>
    </div>
  );
});
