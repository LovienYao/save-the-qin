# 穿越大秦，你能把大秦救到什么程度？

一个纯前端、移动端优先的 24 题沉浸式性格测试。

## 本地运行

在项目根目录运行：

```powershell
npm run dev
```

然后访问 `http://localhost:4173`。

## 文件结构

- `dist/index.html`：三个页面状态（首页 / 答题 / 结果）
- `dist/style.css`：视觉与响应式样式
- `dist/app.js`：交互、计分与结果渲染
- `dist/config.js`：24 道题、选项权重、路线、人物、病灶与结局配置

## 编辑测试内容

题目与规则均集中在 `dist/config.js`。每个选项可以分别影响：

- `scores`：六维能力（S/P/T/H/R/V）
- `route`：四类决策路线
- `fate`：五个人物命运权重
- `illness`：五类帝国病灶修复权重

当前版本已包含可完整体验的首版题目与规则，可直接在配置文件中继续调整文案和权重。

## 调试与模拟

- 浏览器访问 `http://localhost:4173/?debug=1` 可在控制台查看每题选择及完整计分过程。
- `npm test` 运行结构与计分边界测试。
- `npm run simulate` 随机模拟 500,000 组答案并输出分布。

结果页支持生成独立的 1080×1440 PNG 分享卡；移动端可在预览中长按保存。

## Vercel 部署

- Build Command：`npm run build`
- Output Directory：`dist`
- Environment Variables：不需要

项目为纯静态网页，`vercel.json` 已包含所需部署配置。
