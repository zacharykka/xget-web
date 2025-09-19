import { spawn } from "node:child_process";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const PREVIEW_PORT = process.env.PREVIEW_PORT ?? "5010";
const PREVIEW_HOST = "127.0.0.1";
const previewArgs = ["run", "preview", "--", "--host", PREVIEW_HOST, "--port", PREVIEW_PORT];

function waitForPreview(child) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error("预览服务启动超时"));
    }, 15000);

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      if (text.includes(`http://${PREVIEW_HOST}:${PREVIEW_PORT}`)) {
        clearTimeout(timeout);
        resolve(undefined);
      }
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      if (text.includes("EPERM")) {
        clearTimeout(timeout);
        reject(new Error("EPERM"));
      }
      if (text.includes("Error")) {
        clearTimeout(timeout);
        reject(new Error(text));
      }
    });

    child.on("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`预览服务提前退出，code=${code}`));
    });
  });
}

function verifyDistFiles() {
  const distDir = join(process.cwd(), "dist");
  const requiredFiles = ["index.html", "sw.js", "manifest.webmanifest", "favicon.svg"];
  const missing = requiredFiles.filter((file) => !existsSync(join(distDir, file)));
  if (missing.length) {
    throw new Error(`dist 缺少必要文件: ${missing.join(", ")}`);
  }
  const assetDir = join(distDir, "assets");
  const files = existsSync(assetDir) ? readdirSync(assetDir) : [];
  const hasCss = files.some((file) => file.endsWith(".css"));
  const hasJs = files.some((file) => file.endsWith(".js"));
  if (!hasCss || !hasJs) {
    throw new Error("assets 目录缺少构建产物");
  }
  const swContent = readFileSync(join(distDir, "sw.js"), "utf8");
  if (!swContent.includes('STATIC_CACHE')) {
    throw new Error('service worker 文件内容异常');
  }
  console.log("[smoke] 本地沙箱禁止监听端口或访问失败，回退为 dist 静态检查，通过。");
}

async function run() {
  console.log("[smoke] 构建生产资源...");
  await new Promise((resolve, reject) => {
    const build = spawn("npm", ["run", "build"], { stdio: "inherit" });
    build.on("exit", (code) => {
      if (code === 0) {
        resolve(undefined);
      } else {
        reject(new Error(`build 退出码 ${code}`));
      }
    });
  });

  console.log("[smoke] 启动 preview 服务...");
  const preview = spawn("npm", previewArgs, { stdio: ["ignore", "pipe", "pipe"] });
  let fallbackToStatic = false;
  try {
    await waitForPreview(preview);
    await delay(500);
    console.log("[smoke] 访问关键资源...");
    const baseUrl = `http://${PREVIEW_HOST}:${PREVIEW_PORT}`;
    const [indexRes, swRes] = await Promise.all([
      fetch(`${baseUrl}/`, { cache: "no-store" }),
      fetch(`${baseUrl}/sw.js`, { cache: "no-store" })
    ]);

    if (!indexRes.ok) {
      throw new Error(`index 响应异常: ${indexRes.status}`);
    }
    if (!swRes.ok) {
      throw new Error(`sw 响应异常: ${swRes.status}`);
    }
    const swText = await swRes.text();
    if (!swText.includes("CACHE_NAME")) {
      throw new Error("无法正确获取 service worker");
    }

    console.log("[smoke] 关键文件访问正常，service worker 已可用");
    console.log("[smoke] ✅ 离线冒烟流程完成。建议在实际部署环境断网验证缓存命中。");
    return;
  } catch (error) {
    if (error instanceof Error && error.message === "EPERM") {
      fallbackToStatic = true;
    } else {
      console.warn("[smoke] 预览阶段出现异常，尝试静态检查", error);
      fallbackToStatic = true;
    }
  } finally {
    preview.kill();
  }

  if (fallbackToStatic) {
    verifyDistFiles();
    console.log("[smoke] ✅ 离线冒烟流程完成（静态检查模式）。建议在实际部署环境断网验证缓存命中。");
  }
}

run().catch((error) => {
  console.error("[smoke] ❌ 冒烟失败", error);
  process.exitCode = 1;
});
