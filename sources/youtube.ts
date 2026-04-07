import { GOOGLE_API_KEY } from "./commands.ts";
const GLOBAL_URL_PATTERN = /(https?:\/\/[^\s]+)/g;
const GLOBAL_TAG_PATTERN = /#(\w+)/g;

interface VideoInfo {
  video_id: string;
  title: string;
  description: string;
  published_at: string;
  url: string;
}

export async function getRecentVideos(
  channelId: string,
  maxResults: number = 10,
): Promise<VideoInfo[]> {
  // Get the uploads playlist ID
  const channelUrl = "https://www.googleapis.com/youtube/v3/channels";
  const channelParams = new URLSearchParams({
    part: "contentDetails",
    id: channelId,
    key: GOOGLE_API_KEY!,
  });

  const channelResponse = await fetch(`${channelUrl}?${channelParams}`);
  const channelData = await channelResponse.json();

  if (!channelData.items || channelData.items.length === 0) {
    throw new Error("Channel not found or invalid channel ID");
  }

  const uploadsPlaylistId =
    channelData.items[0].contentDetails.relatedPlaylists.uploads;

  // Get videos from the uploads playlist
  const playlistUrl = "https://www.googleapis.com/youtube/v3/playlistItems";
  const playlistParams = new URLSearchParams({
    part: "snippet",
    playlistId: uploadsPlaylistId,
    maxResults: maxResults.toString(),
    key: GOOGLE_API_KEY!,
  });

  const playlistResponse = await fetch(`${playlistUrl}?${playlistParams}`);
  const playlistData = await playlistResponse.json();

  // Extract video information
  const videos: VideoInfo[] = [];
  for (const item of playlistData.items) {
    const snippet = item.snippet;
    const videoInfo: VideoInfo = {
      video_id: snippet.resourceId.videoId,
      title: snippet.title,
      description: snippet.description,
      published_at: snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${snippet.resourceId.videoId}`,
    };
    videos.push(videoInfo);
  }

  return videos;
}

function parseYoutubeDate(dateString: string): Date {
  // YouTube returns dates in ISO 8601 format: "2022-01-13T02:32:43Z"
  // Parse ISO 8601 format directly
  return new Date(dateString);
}

function dayWithSuffix(day: number): string {
  if ([11, 12, 13].includes(day)) {
    return `${day}th`;
  }

  const lastDigit = day % 10;

  if (lastDigit === 1) {
    return `${day}st`;
  } else if (lastDigit === 2) {
    return `${day}nd`;
  } else if (lastDigit === 3) {
    return `${day}rd`;
  } else {
    return `${day}th`;
  }
}

function formatDateReadable(
  dateString: string,
  useSuffix: boolean = false,
): string {
  const dt = parseYoutubeDate(dateString);

  // Get month abbreviation
  const monthAbbrev = dt.toLocaleDateString("en-US", { month: "short" });

  // Format day with or without suffix
  const dayStr = useSuffix
    ? dayWithSuffix(dt.getDate())
    : dt.getDate().toString();

  // Format as "Mon. DD, YYYY"
  return `${monthAbbrev}. ${dayStr}, ${dt.getFullYear()}`;
}

export function processVideos(videos: VideoInfo[]): string {
  let videoMarkdown = "";
  let index = 0;
  for (const video of videos) {
    const date = formatDateReadable(video.published_at, true);
    const title = video.title;
    const url = video.url;
    let description = video.description;
    description = description.replace(GLOBAL_URL_PATTERN, "[$1]($1)");
    description = description.replace(
      GLOBAL_TAG_PATTERN,
      "[#$1](https://www.youtube.com/hashtag/$1)",
    );
    videoMarkdown += `\\emoji{clock} **[${date}] ${title}:** [View on Youtube](${url})\\\n${description}`;
    if (index !== videos.length - 1) {
      videoMarkdown += `\\\n\\\n`;
    }
    index += 1;
  }
  return videoMarkdown;
}
