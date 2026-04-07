import dotenv from "dotenv";
import { processMarkdown } from "./patch.ts";

dotenv.config();

const UPDATE_YOUTUBE_WIDGET = process.env.UPDATE_YOUTUBE_WIDGET;

export async function fetchMarkdown(body: string) {
  const regex = /link\s*=\s*"(.*?)"/;
  const match = body.match(regex);
  if (!match) {
    throw new Error("No link found.");
  }
  const link = match[1];

  const response = await fetch(link);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  let markdown: string = await response.text();
  markdown = processMarkdown(markdown);
  return `${markdown}`;
}

export async function youtubeUploadsWidget(body: String) {
  if (UPDATE_YOUTUBE_WIDGET == "False") {
    return "";
  }

  const match = body.match(/channel\s*=\s*\"(.*?)\"/);
  if (!match) {
    throw new Error("No channel url found.");
  }
  const channel = String(match[1]);

  const recent_videos = await getRecentVideos(channel, 2);
  const video_markdown = processVideos(recent_videos);

  return `${video_markdown}`;
}
