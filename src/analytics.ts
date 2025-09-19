const endpoint = (import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined)?.trim();
const rawBatchSize = Number.parseInt((import.meta.env.VITE_ANALYTICS_BATCH_SIZE as string | undefined) ?? "5", 10);
const BATCH_SIZE = Number.isFinite(rawBatchSize) && rawBatchSize > 0 ? rawBatchSize : 5;
const rawInterval = Number.parseInt((import.meta.env.VITE_ANALYTICS_FLUSH_INTERVAL as string | undefined) ?? "10000", 10);
const FLUSH_INTERVAL = Number.isFinite(rawInterval) && rawInterval > 0 ? rawInterval : 10000;
const rawTimeout = Number.parseInt((import.meta.env.VITE_ANALYTICS_TIMEOUT as string | undefined) ?? "4000", 10);
const REQUEST_TIMEOUT = Number.isFinite(rawTimeout) && rawTimeout > 0 ? rawTimeout : 4000;
const FAILURE_THRESHOLD = 3;

interface TrackPayload {
  event: string;
  timestamp: string;
  [key: string]: unknown;
}

interface Envelope {
  events: TrackPayload[];
  reason?: string;
}

const queue: TrackPayload[] = [];
let initialized = false;
let flushTimer: number | undefined;
let failureCount = 0;
let disabled = false;

const isBrowser = typeof window !== "undefined";
const hasNavigator = typeof navigator !== "undefined";

function disableAnalytics(reason?: unknown) {
  if (disabled) {
    return;
  }
  disabled = true;
  queue.length = 0;
  if (flushTimer) {
    window.clearInterval(flushTimer);
    flushTimer = undefined;
  }
  if (reason) {
    console.warn("Analytics 已降级：连续失败次数过多", reason);
  } else {
    console.warn("Analytics 已降级：未提供端点");
  }
}

function handleFailure(reason: unknown) {
  failureCount += 1;
  console.warn("发送埋点失败", reason);
  if (failureCount >= FAILURE_THRESHOLD) {
    disableAnalytics(reason);
  }
}

function handleSuccess() {
  failureCount = 0;
}

async function sendEnvelope(envelope: Envelope): Promise<void> {
  if (!endpoint || disabled || !hasNavigator) {
    return;
  }

  const body = JSON.stringify(envelope);
  const canUseBeacon = typeof navigator.sendBeacon === "function";

  if (canUseBeacon && envelope.reason !== "interval") {
    const blob = new Blob([body], { type: "application/json" });
    const success = navigator.sendBeacon(endpoint, blob);
    if (!success) {
      handleFailure(new Error("sendBeacon 返回 false"));
    } else {
      handleSuccess();
    }
    return;
  }

  if (!isBrowser) {
    handleFailure(new Error("非浏览器环境，无法发送埋点"));
    return;
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      keepalive: true,
      body,
      signal: controller.signal
    });
    handleSuccess();
  } catch (error) {
    handleFailure(error);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function flushQueue(reason?: string) {
  if (!endpoint || disabled) {
    queue.length = 0;
    return;
  }
  if (!queue.length) {
    return;
  }

  const events = queue.splice(0, queue.length);
  void sendEnvelope({ events, reason });
}

function ensureFlushTimer() {
  if (!isBrowser || FLUSH_INTERVAL <= 0 || disabled) {
    return;
  }
  if (flushTimer) {
    return;
  }
  flushTimer = window.setInterval(() => flushQueue("interval"), FLUSH_INTERVAL);
}

function attachLifecycleHooks() {
  if (!isBrowser || disabled) {
    return;
  }

  const finalize = () => flushQueue("pagehide");
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushQueue("visibilitychange");
    }
  });
  window.addEventListener("pagehide", finalize);
  window.addEventListener("beforeunload", finalize);
}

export function initAnalytics() {
  if (initialized || !endpoint) {
    if (!endpoint) {
      disableAnalytics();
    }
    initialized = true;
    return;
  }
  initialized = true;
  ensureFlushTimer();
  attachLifecycleHooks();
}

export function trackEvent(event: string, data?: Record<string, unknown>) {
  if (!endpoint || disabled) {
    return;
  }

  if (!initialized) {
    initAnalytics();
  }

  if (disabled) {
    return;
  }

  queue.push({ event, timestamp: new Date().toISOString(), ...data });
  if (queue.length >= BATCH_SIZE) {
    flushQueue("batchSize");
  }
}
