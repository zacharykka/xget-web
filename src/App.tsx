import { useCallback, useMemo, useReducer } from "react";
import { convertToXget, DEFAULT_XGET_BASE, normalizeInputUrl } from "./platforms";
import { trackEvent } from "./analytics";
import { useCopyToClipboard } from "./hooks/useCopyToClipboard";
import { URLInput } from "./components/URLInput";
import { URLOutput } from "./components/URLOutput";

const configuredBase = (import.meta.env.VITE_XGET_BASE as string | undefined)?.trim();
const RESOLVED_BASE = configuredBase && configuredBase.length > 0 ? configuredBase : DEFAULT_XGET_BASE;

interface State {
  sourceUrl: string;
}

type Action =
  | { type: "SET_SOURCE_URL"; value: string };

const initialState: State = {
  sourceUrl: ""
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_SOURCE_URL":
      return { ...state, sourceUrl: action.value };
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { sourceUrl } = state;
  const { copied, isPending: isCopyPending, copy } = useCopyToClipboard();

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

  const handleSourceChange = useCallback((value: string) => {
    dispatch({ type: "SET_SOURCE_URL", value });
  }, []);

  const handleInputBlur = useCallback(() => {
    const normalized = normalizeInputUrl(sourceUrl);
    if (normalized !== sourceUrl) {
      dispatch({ type: "SET_SOURCE_URL", value: normalized });
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
  }, [sourceUrl]);

  const handleCopy = useCallback(async () => {
    if (!result.ok || !result.output) {
      return;
    }
    await copy(result.output, {
      onSuccess: () => trackEvent("copy_success", { platform: result.platform?.id, inputHost: result.input?.hostname }),
      onError: (error) => trackEvent("copy_failed", { message: error.message })
    });
  }, [copy, result]);

  const status = useMemo(
    () => ({
      message: hintText,
      hasError
    }),
    [hintText, hasError]
  );

  return (
    <div className="page">
      <section className="card">
        <header className="card-header">
          <h1>Xget URL 转换器</h1>
          <p>输入原始地址，立即获得 Xget 加速格式。</p>
        </header>

        <URLInput value={sourceUrl} onValueChange={handleSourceChange} onBlur={handleInputBlur} status={status} statusId="source-status" />

        <URLOutput
          value={result.output ?? ""}
          canCopy={result.ok}
          onCopy={handleCopy}
          copied={copied}
          isCopyPending={isCopyPending}
        />
      </section>
    </div>
  );
}

export default App;
