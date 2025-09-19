# Xget URL 转换器前端

轻量化的前端单页应用，用于将主流平台的资源地址一键转换为 [Xget](https://github.com/xixu-me/Xget) 的加速格式，可快速复制并用于下载、CI/CD 或包管理场景。

## ✨ 功能亮点

- 🎯 **智能识别**：扩展多平台域名匹配（GitHub Raw、Hugging Face CDN、容器仓库、AI 推理接口等）
- ⚡ **实时转换**：输入原始 URL 后立即展示加速链接，并自动补全缺失的协议头
- 🔐 **统一域名**：前端按配置文件/环境变量注入的 Xget 实例域名输出结果，避免在页面暴露
- 🧭 **清晰反馈**：错误高亮、状态提示与一键复制体验
- 📚 **可拓展映射**：通过 `src/platforms.ts` 维护平台前缀映射，配套单元测试保障规则准确性
- 📱 **PWA 支持**：内置 manifest、Service Worker，可在支持的浏览器内离线访问
- 📊 **可选埋点**：通过环境变量配置批量上报端点，借助 `navigator.sendBeacon` 汇总使用情况

## 🧱 技术栈

- [Vite 5](https://vitejs.dev/) + [React 18](https://react.dev/) + TypeScript
- 纯 CSS 自定义样式（无额外 UI 框架）
- `lucide-react` 作为轻量图标库

## 📦 快速开始

```bash
# 安装依赖
npm install --registry=https://registry.npmjs.org/

# 开发模式
npm run dev
# 浏览器访问 http://localhost:5173

# 生产构建
npm run build
# 预览生产构建
npm run preview
```

## 🔄 URL 转换规则

| 平台 | 前缀 | 示例原始地址 | 转换后地址 |
| --- | --- | --- | --- |
| GitHub | `gh` | `https://github.com/xixu-me/Xget` | `https://xget.xi-xu.me/gh/xixu-me/Xget` |
| GitHub Raw | `gh` | `https://raw.githubusercontent.com/xixu-me/Xget/main/README.md` | `https://xget.xi-xu.me/gh/xixu-me/Xget/main/README.md` |
| Hugging Face | `hf` | `https://huggingface.co/microsoft/phi-2` | `https://xget.xi-xu.me/hf/microsoft/phi-2` |
| npm | `npm` | `https://registry.npmjs.org/react/-/react-18.2.0.tgz` | `https://xget.xi-xu.me/npm/react/-/react-18.2.0.tgz` |
| conda 官方 | `conda` | `https://repo.anaconda.com/pkgs/main/linux-64/numpy-1.26.3.conda` | `https://xget.xi-xu.me/conda/pkgs/main/linux-64/numpy-1.26.3.conda` |
| conda 社区 | `conda` | `https://conda.anaconda.org/conda-forge/linux-64/repodata.json` | `https://xget.xi-xu.me/conda/community/conda-forge/linux-64/repodata.json` |
| AI 推理接口 | `ip` | `https://api.openai.com/v1/chat/completions` | `https://xget.xi-xu.me/ip/v1/chat/completions` |
| 容器镜像 | `cr` | `https://ghcr.io/xixu-me/xget:latest` | `https://xget.xi-xu.me/cr/xixu-me/xget:latest` |

> 完整平台列表与描述详见 `src/platforms.ts`，如需新增平台，只需补充匹配规则并调整描述，同时更新测试用例。

## ⚙️ 配置

### Xget 实例域名

- `.env` 或运行环境：设置 `VITE_XGET_BASE=https://xget.your-domain.com`
- Cloudflare Pages：在环境变量面板设置 `VITE_XGET_BASE`
- Docker 构建：`VITE_XGET_BASE=... npm run build`

### 批量埋点

- `VITE_ANALYTICS_ENDPOINT=https://example.com/collect` ：设置埋点上报服务地址
- `VITE_ANALYTICS_BATCH_SIZE=10`（可选）：队列长度到达阈值立即 flush，默认 `5`
- `VITE_ANALYTICS_FLUSH_INTERVAL=15000`（可选）：批量定时上报间隔（毫秒），默认 `10000`

### PWA

- manifest 与 Service Worker 已自动注册，部署后可在浏览器 DevTools 的 Application 面板看到缓存内容

## 🧪 测试与冒烟

```bash
npm run test          # Vitest 单元测试
npm run smoke:offline # 构建 + preview + 关键文件探活
```

> Vitest 在受限环境下可能输出一次 `listen EPERM 0.0.0.0:24678`，为沙箱阻止监听端口所致，不影响测试结论。

离线冒烟脚本会自动：
1. 执行生产构建
2. 启动 `npm run preview -- --host 127.0.0.1 --port 5010`
3. 拉取 `index.html` 及 `sw.js`，确认 service worker 可用
完成后会停掉预览服务。建议在 Cloudflare Pages 或容器环境中手动断网验证缓存命中情况。

## ☁️ 部署

### Cloudflare Pages

1. `npm run build`
2. 上传 `dist/` 目录或在控制台配置 Build 命令：`npm run build`
3. 部署完成后即可离线访问（浏览器首次访问需联网缓存）

### 容器部署

项目内置多阶段构建的 `Dockerfile`，将静态资源编译并由 Nginx 提供服务。

```bash
# 构建镜像
docker build -t xget-web .

# 运行容器并映射端口
docker run -d --name xget-web -p 8080:80 xget-web
```

如需自定义 Nginx 行为，可修改 `deploy/nginx.conf` 并重新构建镜像。

## 🧪 推荐验证

- `npm run dev` 下验证常见平台 URL 与异常输入（缺协议、非支持域）
- `npm run test` 检查转换规则是否覆盖常见场景
- `npm run smoke:offline` 结合浏览器断网模式，确认缓存命中

## 📚 参考资料

- [Xget 项目介绍](./XgetIntro.md)
- [Xget 主仓库](https://github.com/xixu-me/Xget)

欢迎在此基础上继续扩展平台映射或加入更多特色功能。
