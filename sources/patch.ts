const GLOBAL_IMAGE_PATTERN =
  /!\[([^\]]*)\]\(([^\s\)]+)(?:\s+[\"']([^\"']*)[\"'])?\)/g;
const MATCH_IMAGE_PATTERN =
  /!\[([^\]]*)\]\(([^\s\)]+)(?:\s+[\"']([^\"']*)[\"'])?\)/m;
const GLOBAL_HEADER_PATTERN = /^(\#{1,6})\s+(.+?)(?:\s*\#*)?$/gm;
const MATCH_HEADER_PATTERN = /^(\#{1,6})\s+(.+?)(?:\s*\#*)?$/m;
const GLOBAL_CODE_BLOCK_PATTERN = /```[\s\S]*?```/g;
var OPEN_WORKS_CITED_DIV = false;

function replaceImage(markdown: string) {
  const [_, image_name, image_link] = markdown.match(MATCH_IMAGE_PATTERN) || [];
  if (image_name.startsWith("emoji")) {
    return `\\linkedEmoji{${image_link}}`;
  } else {
    return `![${image_name}](${image_link})`;
  }
}

function replaceHeader(markdown: string) {
  const [_, header_level, header_text] =
    markdown.match(MATCH_HEADER_PATTERN) || [];

  let works_cited_pretext = "";
  if (OPEN_WORKS_CITED_DIV) {
    OPEN_WORKS_CITED_DIV = false;
    works_cited_pretext = "</div>";
  }

  let anchor_text = header_text.toLowerCase();
  anchor_text = anchor_text.replaceAll(" ", "-");
  anchor_text = anchor_text.replaceAll(".", "");
  anchor_text = anchor_text.replaceAll(",", "");
  anchor_text = anchor_text.replaceAll("?", "");
  anchor_text = anchor_text.replaceAll("'", "");
  anchor_text = anchor_text.replaceAll("&", "");

  let works_cited_posttext = "";
  if (header_text == "Works Cited") {
    OPEN_WORKS_CITED_DIV = true;
    works_cited_posttext = `\n<div class="box-double-space">`;
  }

  return `${works_cited_pretext}\\header{${header_text}}{${anchor_text}}${works_cited_posttext}`;
}

function replaceHardCoded(markdown: string) {
  markdown = markdown.replace(
    "# ![bannerAboutMe](https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/banners/aboutMe.png)",
    "\\iconHeader{https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/icons/aboutMe.png}{About Me}{about-me}",
  );
  markdown = markdown.replace(
    "# ![bannerExperience](https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/banners/experience.png)",
    "\\iconHeader{https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/icons/experience.png}{Experience}{experience}",
  );
  markdown = markdown.replace(
    "# ![bannerUpcoming](https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/banners/upcoming.png)",
    "\\iconHeader{https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/icons/upcoming.png}{Upcoming}{upcoming}",
  );
  return markdown;
}

export function processMarkdown(markdown: string) {
  let code_blocks: Array<[string, string]> = [];
  let templated_markdown = markdown;

  let counter = 1;
  for (const [match] of markdown.matchAll(GLOBAL_CODE_BLOCK_PATTERN)) {
    let placeholder = "<codeblock$counter/>";

    let lines = match.split("\n");
    let language = lines[0].substring(3);
    let code = lines.slice(1).join("\n");

    if (language == "mermaid") {
      code_blocks.push([
        placeholder,
        `\n<pre class="mermaid">\n${code}\n</pre>\n`,
      ]);
    } else {
      code_blocks.push([placeholder, match]);
    }

    templated_markdown = templated_markdown.replace(match, placeholder);
    counter += 1;
  }

  templated_markdown = replaceHardCoded(templated_markdown);
  templated_markdown = templated_markdown.replace(
    GLOBAL_IMAGE_PATTERN,
    replaceImage,
  );
  templated_markdown = templated_markdown.replace(
    GLOBAL_HEADER_PATTERN,
    replaceHeader,
  );
  if (OPEN_WORKS_CITED_DIV) {
    OPEN_WORKS_CITED_DIV = false;
    templated_markdown += "\n</div>";
  }

  markdown = templated_markdown;
  for (const [placeholder, code_block] of code_blocks) {
    markdown = markdown.replace(placeholder, code_block);
  }

  return markdown;
}
