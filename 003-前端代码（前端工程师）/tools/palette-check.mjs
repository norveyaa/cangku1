/**
 * 伴读智汇 · 图表配色最终方案校验（dataviz 方法论）
 *
 * 结论（浅色表面 #FFFFFF / 暗色表面 #222631）：
 *   1. 单序列图表：浅色 #1F3A5F（品牌墨蓝，白面 ≥3:1）；暗色 #4E86C8（≥3:1）
 *   2. 双序列图表（需区分身份）：#4E86C8（亮墨蓝，snap-to-passing）+ #C87F2E（深杏橘）
 *      —— 两模式六项检查全部通过（品牌墨蓝色相 OKLCH 彩度 <0.10，无法通过色度下限，
 *        故多序列场景按 snap-to-passing 升阶为 #4E86C8）
 *   3. 强调形式：品牌蓝 + 灰色上下文（#B9B7B0 / #6A6D76），不占用分类槽位
 *   4. 顺序色阶（热力图）：浅 #8DACBA→#00083B；暗 #00204E→#6F95BA（暗色翻转锚点）
 *
 * 用法: node tools/palette-check.mjs
 */
import { validate, contrast } from 'file:///C:/Users/ASUS/AppData/Local/Temp/claude/bundled-skills/2.1.304/89d6c10016b3ec2528b044681ab8fad9/dataviz/scripts/validate_palette.js';

const CASES = [
  { name: '双序列（亮墨蓝+深杏橘）· 浅色', palette: ['#4E86C8', '#C87F2E'], mode: 'light', surface: '#FFFFFF' },
  { name: '双序列（亮墨蓝+深杏橘）· 暗色', palette: ['#4E86C8', '#C87F2E'], mode: 'dark', surface: '#222631' },
];

let allOk = true;
for (const c of CASES) {
  const r = validate(c.palette, { mode: c.mode, surface: c.surface });
  const warns = r.report.filter(([, s]) => s === 'WARN').map(([n]) => n);
  const fails = r.report.filter(([, s]) => s === 'FAIL').map(([n]) => n);
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${c.name}${warns.length ? `  (WARN: ${warns.join(',')} → 已配直接标注+数据表视图)` : ''}`);
  if (!r.ok) { allOk = false; console.log('   FAIL:', fails.join(', ')); }
}

// 单序列标记：dataviz 六项检查针对分类序列（身份区分）；
// 单序列只需 WCAG 对比度 ≥3:1（标记 vs 表面），用导出的 contrast() 检查
const singles = [
  ['单序列 #1F3A5F · 浅色', '#1F3A5F', '#FFFFFF'],
  ['单序列 #4E86C8 · 暗色', '#4E86C8', '#222631'],
  ['单序列 #4E86C8 · 浅色', '#4E86C8', '#FFFFFF'],
  ['单序列 #C87F2E · 暗色', '#C87F2E', '#222631'],
];
for (const [name, hex, surface] of singles) {
  const c = contrast(hex, surface);
  const ok = c >= 3.0;
  if (!ok) allOk = false;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}（对比度 vs ${surface} = ${c.toFixed(2)}:1）`);
}

console.log(allOk ? '\n全部校验通过 ✅' : '\n存在失败项 ❌');
process.exit(allOk ? 0 : 1);
