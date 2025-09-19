const SW_PATH = "/sw.js";

export function registerServiceWorker() {
  if (typeof window === "undefined") {
    return;
  }

  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(SW_PATH)
      .catch((error) => {
        console.error("Service worker 注册失败", error);
      });
  });
}
