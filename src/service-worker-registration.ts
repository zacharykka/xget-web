const SW_PATH = "/sw.js";

export function registerServiceWorker() {
  if (typeof window === "undefined") {
    return;
  }

  if (!("serviceWorker" in navigator)) {
    return;
  }

  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "SW_ACTIVATED") {
      window.dispatchEvent(new CustomEvent("sw:activated", { detail: event.data }));
      if (import.meta.env.DEV) {
        console.info(`[sw] activated version ${event.data.version ?? "unknown"}`);
      }
    }
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(SW_PATH)
      .catch((error) => {
        console.error("Service worker 注册失败", error);
      });
  });
}
