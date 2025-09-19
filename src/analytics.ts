const endpoint = (import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined)?.trim();
const rawBatchSize = Number.parseInt((import.meta.env.VITE_ANALYTICS_BATCH_SIZE as string | undefined) ?? "5", 10);
const BATCH_SIZE = Number.isFinite(rawBatchSize) && rawBatchSize > 0 ? rawBatchSize : 5;
const rawInterval = Number.parseInt((import.meta.env.VITE_ANALYTICS_FLUSH_INTERVAL as string | undefined) ?? "10000", 10);
const FLUSH_INTERVAL = Number.isFinite(rawInterval) && rawInterval > 0 ? rawInterval : 10000;

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

function sendEnvelope(envelope: Envelope) {
  const body = JSON.stringify(envelope);
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(endpoint!, blob);
    return;
  }

  void fetch(endpoint!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    keepalive: true,
    body
  });
}

function flushQueue(reason?: string) {
  if (!endpoint) {
    queue.length = 0;
    return;
  }
  if (!queue.length) {
    return;
  }

  const events = queue.splice(0, queue.length);
  try {
    sendEnvelope({ events, reason });
  } catch (error) {
    console.error("发送埋点失败", error);
  }
}

function ensureFlushTimer() {
  if (typeof window === "undefined") {
    return;
  }
  if (flushTimer || FLUSH_INTERVAL <= 0) {
    return;
  }
  flushTimer = window.setInterval(() => flushQueue("interval"), FLUSH_INTERVAL);
}

function attachLifecycleHooks() {
  if (typeof window === "undefined") {
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
    initialized = true;
    return;
  }
  initialized = true;
  ensureFlushTimer();
  attachLifecycleHooks();
}

export function trackEvent(event: string, data?: Record<string, unknown>) {
  if (!endpoint) {
    return;
  }

  if (!initialized) {
    initAnalytics();
  }

  queue.push({ event, timestamp: new Date().toISOString(), ...data });
  if (queue.length >= BATCH_SIZE) {
    flushQueue("batchSize");
  }
}
