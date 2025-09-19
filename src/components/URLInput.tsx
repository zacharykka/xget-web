import { memo } from "react";
import { Link2 } from "lucide-react";

export interface URLInputStatus {
  message: string;
  hasError: boolean;
}

export interface URLInputProps {
  value: string;
  onValueChange: (value: string) => void;
  onBlur?: () => void;
  status: URLInputStatus;
  statusId?: string;
}

export const URLInput = memo(function URLInput({
  value,
  onValueChange,
  onBlur,
  status,
  statusId = "url-input-status"
}: URLInputProps) {
  const statusClass = `status ${status.hasError ? "status-warn" : "status-success"}`;
  const dotClass = status.hasError ? "dot dot-warn" : "dot dot-success";
  const hasStatus = Boolean(status.message);

  return (
    <div className="input-group">
      <label htmlFor="source" className="label">
        原始 URL
      </label>
      <div className="input-wrapper">
        <Link2 className="input-icon" size={18} />
        <input
          id="source"
          className={`input ${status.hasError ? "input-error" : ""}`}
          value={value}
          placeholder="https://github.com/owner/repo"
          onChange={(event) => onValueChange(event.target.value)}
          onBlur={onBlur}
          aria-invalid={status.hasError}
          aria-describedby={statusId}
        />
      </div>
      {hasStatus ? (
        <div className={statusClass} id={statusId} role={status.hasError ? "alert" : "status"}>
          <span className={dotClass} />
          <span>{status.message}</span>
        </div>
      ) : null}
    </div>
  );
});
