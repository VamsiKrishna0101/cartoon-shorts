// 2D doodle runner: same window API as main.js so render.mjs works with PAGE=doodle.html
import * as D from "./ink.js";
const slug = new URLSearchParams(location.search).get("story") || "pumped";
const story = (await import(`../stories/${slug}/doodle.js`)).default;
const cv = document.querySelector("canvas"), g = cv.getContext("2d");
await story.build?.(D);
window.FRAMES = story.frames;
window.renderFrame = (f) => { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 1080, 1920); D.setFrame(f); story.frame(D, g, f); };
window.ready = true;
