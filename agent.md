# Agent Rules

## SEO / Indexing

- 所有可索引页面必须输出与当前页面 URL 一致的 canonical，禁止在 layout 中写死全站共用 canonical。
- 多语言页面必须同时输出完整的 `hreflang` alternates，默认语言 `en` 的正式 URL 不得带 `/en` 前缀。
- 站点不得基于 `Accept-Language` 或 locale cookie 对 sitemap 中的正式 URL 返回 3xx；`next-intl` 路由必须保持 `localeDetection: false`。
- 新增页面或改 SEO 时，统一复用 `src/lib/seo.ts`，不要在页面里手写站点 URL、canonical 或 hreflang 逻辑。
- 修改 sitemap、canonical、路由策略后，至少验证 `/`、`/quizzes`、`/blog` 在不同 `Accept-Language` 下都返回 200，且 canonical 指向自身。
