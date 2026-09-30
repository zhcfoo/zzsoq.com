# zzsoq.com · 生日快乐

一封会随滑动变化的生日信：花束开场 → 序 → 2003.10.15（神舟五号 · 《不可思议》· 海口）→ 活过的天数 → 长大 → 我们遇见 → 争吵 → 彼此相爱 → 生日快乐（吹蜡烛、拆信封）。

风格：珍珠白 + 香槟金箔 + 虹彩光 + 闪烁碎钻；手机和电脑同一套构图。
纯静态网页，不用构建。动画用 GSAP + ScrollTrigger，平滑滚动用 Lenis，字体为思源宋体 / Cormorant / Pinyon Script，全部本地托管（`vendor/`、`fonts/`），国内打开不依赖外网 CDN。

## 你需要改的

1. **`js/config.js`**：她的名字、你们在一起的日期、成长时间轴、回忆卡片、吵架的句子、最后的信、音乐起止秒数。
2. **`music/`**：放入你自己的音乐文件（见 `music/README.md`）。
3. **`photos/`**（可选）：成长拍立得和回忆卡片的照片，在 `js/config.js` 里填 `photo: 'photos/xxx.jpg'`。

## 本地预览

必须用本地服务器打开（直接双击 index.html 时浏览器会禁用音频处理）。
注意要用支持“断点续传(Range)”的服务器，否则 Chrome 里跳到副歌的功能不生效（`python -m http.server` 不支持）：

```bash
npx http-server -p 8000
# 打开 http://localhost:8000     调节音乐起止点：http://localhost:8000/?tune
```

GitHub Pages / Cloudflare Pages / Vercel 等正式托管都支持 Range，没问题。

## 音乐是怎么工作的

- 每一段有自己的 BGM（`index.html` 里每个 `<section>` 的 `data-track`），滑到新段落时 2.6 秒交叉淡入淡出。
- 每首歌从 `start` 秒开始（直接进副歌），到 `end` 秒自动淡出、跳回 `start` 循环，停在一个段落也会一直放。
- 离开一首歌再回来，会接着上次的位置放，而不是重头开始。
- 同一首歌在不同段落会做不同的实时处理（`data-fx`：朦胧 / 原声 / 温暖 / 遥远），比如“争吵”里《你不在》像隔着墙，雨停时慢慢变清楚。
- 吹蜡烛时会响起八音盒版《生日快乐》，背景音乐自动压低。

## 部署

任何静态托管都可以（GitHub Pages、Cloudflare Pages、Vercel、国内的对象存储等）。
注意：如果仓库/网站是公开的，里面的音乐文件任何人都能下载，版权上请自行斟酌（例如把仓库设为私有，或只在本地/私有托管上使用）。
