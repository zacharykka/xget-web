# Xget URL 转换器前端

轻量化的前端单页应用，用于将主流平台的资源地址一键转换为 [Xget](https://github.com/xixu-me/Xget) 的加速格式，可快速复制并用于下载、CI/CD 或包管理场景。

## ✨ 功能亮点

- 🎯 **智能识别**：基于域名匹配自动识别 GitHub、GitLab、包管理、AI 模型、容器仓库等平台
- ⚡ **实时转换**：输入原始 URL 后立即展示加速链接
- 🔐 **统一域名**：前端按配置文件/环境变量注入的 Xget 实例域名输出结果，避免在页面暴露
- 📚 **可拓展映射**：通过 `src/platforms.ts` 维护平台前缀映射，便于后续扩容
- 🚀 **多种部署**：同时提供 Cloudflare Pages 与容器镜像部署方案

## 🧱 技术栈

- [Vite 5](https://vitejs.dev/) + [React 18](https://react.dev/) + TypeScript
- 纯 CSS 自定义样式（无额外 UI 框架）
- `lucide-react` 作为轻量图标库

## 📦 快速开始

```bash
# 安装依赖
npm install

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
| Hugging Face | `hf` | `https://huggingface.co/microsoft/phi-2` | `https://xget.xi-xu.me/hf/microsoft/phi-2` |
| npm | `npm` | `https://registry.npmjs.org/react/-/react-18.2.0.tgz` | `https://xget.xi-xu.me/npm/react/-/react-18.2.0.tgz` |
| conda 官方 | `conda` | `https://repo.anaconda.com/pkgs/main/linux-64/numpy-1.26.3.conda` | `https://xget.xi-xu.me/conda/pkgs/main/linux-64/numpy-1.26.3.conda` |
| conda 社区 | `conda` | `https://conda.anaconda.org/conda-forge/linux-64/repodata.json` | `https://xget.xi-xu.me/conda/community/conda-forge/linux-64/repodata.json` |
| 容器镜像 | `cr` | `https://ghcr.io/xixu-me/xget:latest` | `https://xget.xi-xu.me/cr/xixu-me/xget:latest` |

> 完整平台列表与描述详见 `src/platforms.ts`，如需新增平台，只需补充匹配规则并调整描述。

## ⚙️ 配置 Xget 实例域名

- 开发或构建阶段：在 `.env` 中写入 `VITE_XGET_BASE=https://xget.your-domain.com`
- Cloudflare Pages：使用 `wrangler secret put VITE_XGET_BASE` 或在环境变量面板设置同名变量
- Docker/容器部署：构建前在环境中写入 `VITE_XGET_BASE`，如：

  ```bash
  VITE_XGET_BASE=https://xget.your-domain.com npm run build
  ```

运行时前端不会显示该域名，只在转换结果中使用。

## ☁️ Cloudflare Pages 部署

1. 本地构建产物：`npm run build`
2. 通过 Wrangler 部署（需提前执行 `wrangler login` 完成授权）：

   ```bash
   npx wrangler pages deploy dist --project-name=xget-url-converter
   ```

3. 或者在 Cloudflare Pages 控制台新建项目：
   - Build 命令：`npm run build`
   - Build 输出目录：`dist`
   - Node 版本建议 `20.x`

`wrangler.toml` 已内置 `pages_build_output_dir = "dist"`，如需在 Cloudflare 端自定义默认域名，使用环境变量 `VITE_XGET_BASE`。

## 📦 容器部署

项目内置多阶段构建的 `Dockerfile`，将静态资源编译并由 Nginx 提供服务。

```bash
# 构建镜像
docker build -t xget-web .

# 运行容器并映射端口
docker run -d --name xget-web -p 8080:80 xget-web
```

如需自定义 Nginx 行为，可修改 `deploy/nginx.conf` 并重新构建镜像。

## 🧪 推荐测试

- `npm run dev` 下手动验证不同平台 URL 的转换结果
- 使用 `npm run build && npm run preview` 检查构建产物结构
- 上线前建议配合 Cloudflare 或容器环境做一次端到端冒烟

## 📚 参考资料

- [Xget 项目介绍](./XgetIntro.md)
- [Xget 主仓库](https://github.com/xixu-me/Xget)

欢迎在此基础上继续扩展平台映射或加入更多特色功能。
