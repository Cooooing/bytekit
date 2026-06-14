# Bytekit

面向 Cloudflare Workers 的轻量工具站。

## 开发命令

```sh
npm run dev
npm run build
npm run cf-typegen
npm run deploy
```

## 项目结构

```text
src/pages/          Astro 页面与 API 路由
src/components/     Astro 外壳组件与 React 工具组件
src/lib/tools/      无框架工具函数
src/lib/cloudflare/ D1、R2、运行时环境封装
migrations/         D1 数据库迁移
```

## Cloudflare 资源

`wrangler.jsonc` 已预留 `DB` 和 `BUCKET` 绑定。部署前需要在 Cloudflare 创建 D1 数据库和 R2 bucket，并替换 `database_id`。
