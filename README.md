# aiboard.bjwantwant

米果质量数据看板。前端静态页 + 同域 API（Cloudflare Pages Functions）+ KV 持久化。

## 架构

```
企业微信智能表格
   ↓ 大圆拉数
POST https://qa-want.pages.dev/api/update   （Bearer PASSWORD）
   ↓
Cloudflare KV  binding: AIBOARD_KV  key: aiboard_data
   ↓
GET  https://qa-want.pages.dev/api/data     （前端自动调用）
   ↓
看板页面 index.html
```

不用 workers.dev。该域名在境内 DNS 被污染（解析到 Facebook 段），不可达。

## 面板配置（只做一次）

在 Cloudflare 控制台 qa-want 项目里操作。

1. 建 KV
   存储和数据库 → KV → 创建命名空间，名称 `qa-board-kv`

2. 绑 KV
   qa-want → 设置 → 函数 → KV 命名空间绑定
   变量名 `AIBOARD_KV`，选上一步的命名空间

3. 加密码
   qa-want → 设置 → 变量和密钥 → 添加
   名称 `PASSWORD`，值 `sy516149756`，类型选「密钥」（加密）

   注：接口也兼容中文名「秘钥」「密钥」，但建议统一用 `PASSWORD`。

4. 重新部署
   push 到 main 会自动部署。也可在「部署」页手动重试。

## 验证

```bash
# 读
curl https://qa-want.pages.dev/api/data

# 写
curl -X POST https://qa-want.pages.dev/api/update \
  -H "Authorization: Bearer sy516149756" \
  -H "Content-Type: application/json" \
  -d '{"all":{"alert":{"danger":{"n":1}}}}'
```

`PASSWORD_NOT_SET` / `KV_NOT_BOUND` 表示面板配置没生效。

## 旧方案（已废弃）

`qa-data-api.2943764386.workers.dev`。两个问题叠加：部署成了纯静态资产 Worker（无运行时代码，无法加变量），KV id 从未填过真实值，域名在境内不可达。
