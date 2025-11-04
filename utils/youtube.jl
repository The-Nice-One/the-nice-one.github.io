function get_recent_videos(channel_id::String; max_results::Int=10)
    # Get the uploads playlist ID
    channel_url = "https://www.googleapis.com/youtube/v3/channels"
    channel_params = Dict(
        "part" => "contentDetails",
        "id" => channel_id,
        "key" => GOOGLE_API_KEY
    )
    
    channel_response = HTTP.get(channel_url; query=channel_params)
    channel_data = JSON.parse(String(channel_response.body))
    
    if isempty(channel_data["items"])
        error("Channel not found or invalid channel ID")
    end
    uploads_playlist_id = channel_data["items"][1]["contentDetails"]["relatedPlaylists"]["uploads"]
    
    # Get videos from the uploads playlist
    playlist_url = "https://www.googleapis.com/youtube/v3/playlistItems"
    playlist_params = Dict(
        "part" => "snippet",
        "playlistId" => uploads_playlist_id,
        "maxResults" => string(max_results),
        "key" => GOOGLE_API_KEY
    )
    
    playlist_response = HTTP.get(playlist_url; query=playlist_params)
    playlist_data = JSON.parse(String(playlist_response.body))
    
    # Extract video information
    videos = []
    for item in playlist_data["items"]
        snippet = item["snippet"]
        video_info = Dict(
            "video_id" => snippet["resourceId"]["videoId"],
            "title" => snippet["title"],
            "description" => snippet["description"],
            "published_at" => snippet["publishedAt"],
            "url" => "https://www.youtube.com/watch?v=$(snippet["resourceId"]["videoId"])"
        )
        push!(videos, video_info)
    end
    
    return videos
end

function parse_youtube_date(date_string::String)
    # YouTube returns dates in ISO 8601 format: "2022-01-13T02:32:43Z"
    # Remove the 'Z' if present and parse
    clean_date = replace(date_string, "Z" => "")
    
    # Handle both with and without milliseconds
    if occursin(".", clean_date)
        return DateTime(clean_date, dateformat"yyyy-mm-ddTHH:MM:SS.s")
    else
        return DateTime(clean_date, dateformat"yyyy-mm-ddTHH:MM:SS")
    end
end

function day_with_suffix(day::Int)
    if day in [11, 12, 13]
        return "$(day)th"
    end
    
    last_digit = day % 10
    
    if last_digit == 1
        return "$(day)st"
    elseif last_digit == 2
        return "$(day)nd"
    elseif last_digit == 3
        return "$(day)rd"
    else
        return "$(day)th"
    end
end

function format_date_readable(date_string::String; use_suffix::Bool=false)
    dt = parse_youtube_date(date_string)
    
    # Get month abbreviation
    month_abbrev = Dates.format(dt, "u")  # Short month name (Jan, Feb, etc.)
    
    # Format day with or without suffix
    day_str = use_suffix ? day_with_suffix(Dates.day(dt)) : string(Dates.day(dt))
    
    # Format as "Mon. DD, YYYY"
    return "$(month_abbrev). $(day_str), $(Dates.year(dt))"
end

function process_videos(videos)
    video_markdown = ""
    for video in videos 
        local date = format_date_readable(video["published_at"]; use_suffix=true)
        local title = video["title"]
        local url = video["url"]
        local description = video["description"]
        video_markdown *= """\
            \\emoji{clock}  **[$date] $title:** [View on Youtube]($url)\\
            $description\\
            \\
        """
    end 
    return video_markdown
end
