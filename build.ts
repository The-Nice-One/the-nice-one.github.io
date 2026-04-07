import { Site, watch } from "rail-yard";
import { resolve } from "path";
import { execSync } from "child_process";
import { fetchMarkdown, youtubeUploadsWidget } from "./sources/commands.ts";

const isWatch = process.argv.includes("--watch");

const site = new Site({
  output: resolve("dist"),
  baseUrl: "https://the-nice-one.is-a.dev",
  format: "html",
  defaultLayout: "default",
  siteVars: {
    title: "The-Nice-One",
    author: "The-Nice-One",
    lastModified: new Date(Date.now()).toLocaleDateString("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    }),
  },
});

// ── Custom commands ───────────────────────────────────────────────────────────

site.defineCommand(
  "linkedEmoji",
  (link) =>
    `<img style="max-width: 1rem; padding-left: 0; image-rendering: pixelated; " src="${link}" alt="${link}">\n`,
);
site.defineCommand(
  "emoji",
  (link) =>
    `<img style="max-width: 1rem; padding-left: 0; image-rendering: pixelated;" src="https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/emojis_scaled_flattened/${link}.png" alt="https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/emojis_scaled_flattened/${link}.png">\n`,
);
site.defineCommand(
  "largeEmoji",
  (link) =>
    `<img style="max-width: 2rem; padding-left: 0; image-rendering: pixelated;" src="https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/emojis_scaled_flattened/${link}.png" alt="https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/emojis_scaled_flattened/${link}.png">`,
);

site.defineCommand(
  "iconHeader",
  (icon, title, anchor) =>
    `<a id="${anchor}"></a><div class="banner"><a href="#${anchor}"><img class="anchor-icon" style="max-width: 3rem; padding-left: 0; image-rendering: pixelated; margin-right:0.2rem" src="${icon}" alt="${icon}"><spf-text class="spf-process-blue">${title}</spf-text></a></div>\n`,
);
site.defineCommand(
  "header",
  (title, anchor) =>
    `\\html{<a id="${anchor}"></a><div class="banner"><a href="#${anchor}"><img class="anchor-icon" style="max-width: 3rem; padding-left: 0; image-rendering: pixelated; margin-right:0.2rem" src="https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/icons/link.png" alt="https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/icons/link.png"><spf-text class="spf-process-blue">${title}</spf-text></a></div>}\n`,
);

site.defineCommand("fetchMarkdown", fetchMarkdown);
site.defineCommand("youtubeUploadsWidget", youtubeUploadsWidget);

site.defineCommand(
  "pixelImage",
  (link) =>
    `<img style="max-width: 100%; padding-left: 0; image-rendering: pixelated;" src="${link}" alt="${link}">`,
);

site.defineCommand(
  "playgroundCommentWidget",
  () => `
  <script src="https://giscus.app/client.js"
    data-repo="The-Nice-One/PlaygroundProjects"
    data-repo-id="R_kgDOPUc1tg"
    data-category="Announcements"
    data-category-id="DIC_kwDOPUc1ts4CxMF0"
    data-mapping="title"
    data-strict="0"
    data-reactions-enabled="1"
    data-emit-metadata="0"
    data-input-position="top"
    data-theme="light"
    data-lang="en"
    crossorigin="anonymous"
    async>
  </script>
`,
);

site.defineCommand(
  "blogCommentWidget",
  () => `
  <script src="https://giscus.app/client.js"
    data-repo="The-Nice-One/BlogPosts"
    data-repo-id="R_kgDOPv3oyQ"
    data-category="Announcements"
    data-category-id="DIC_kwDOPv3oyc4CxMGA"
    data-mapping="title"
    data-strict="0"
    data-reactions-enabled="1"
    data-emit-metadata="0"
    data-input-position="top"
    data-theme="light"
    data-lang="en"
    crossorigin="anonymous"
    async>
  </script>
`,
);

// ── Assets & layouts ─────────────────────────────────────────────────────────

site.addCSS("./styles/accela.css");
site.addStatic("./public");
site.addLayout("default", "./layouts/base.eta");

// ── Pages ────────────────────────────────────────────────────────────────────

site.addFolder("./pages", { layout: "default" });

// ── Build ─────────────────────────────────────────────────────────────────────

if (isWatch) {
  await watch(site, { paths: ["./pages", "./layouts", "./styles"] });
} else {
  await site.build();
  execSync("npx -y pagefind@1.4 --site dist", { stdio: "inherit" });
}
