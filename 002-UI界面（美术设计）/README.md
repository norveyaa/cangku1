# 伴读智汇 · 个人成长中心（界面还原稿）

对 Figma 设计稿的一比一还原，静态 HTML/CSS，像素级对齐。

## 来源

- Figma 文件：`687WFWJWfbQjwrmg0kcc6f`（Untitled）
- 页面节点：`6:17959`（1440 × 1961，桌面端单页）
- 还原方式：通过 Figma API 读取节点树（314 个节点），按 `absoluteBoundingBox` 精确布局生成

## 文件结构

```
index.html              页面（自包含，含内联样式）
assets/
  fonts/fonts.css       Noto Sans SC / Noto Serif SC 本地子集（仅页面用字，7.9MB）
  fonts/*.woff2         字体子集文件
  *.svg                 20 个矢量图标（Figma 官方导出）
  *.png                 2 张书籍封面插图（Figma 官方导出，2x）
```

## 使用

直接用浏览器打开 `index.html` 即可，无需联网、无需安装字体（已内嵌子集）。

## 还原说明

- 全部元素按设计稿绝对定位，尺寸/坐标保留两位小数
- 文字使用与设计稿一致的 Noto Sans SC / Noto Serif SC（衬线标题 + 无衬线正文），字号、字重、行高、字距均按原值
- 矢量图标使用 Figma 服务端导出的 SVG，描边效果与设计稿完全一致
- 已按 Figma 官方渲染图做逐像素对比：结构、位置、颜色、图片、图标零差异；剩余差异仅为文字抗锯齿（Figma 光栅化器与浏览器渲染引擎的固有差异）
