import * as E from "./engine.js";
const slug = new URLSearchParams(location.search).get("story") || "test";
const story = (await import(`./stories/${slug}/story.js`)).default;
await story.build(E);
window.FRAMES = story.frames;
window.renderFrame = (f) => { E.beginFrame(f); story.frame(E, f); E.render(); };
window.ready = true;
