using HTTP
using JSON
using DotEnv

DotEnv.load!()

const GOOGLE_API_KEY = ENV["GOOGLE_API_KEY"]
const UPDATE_YOUTUBE_WIDGET = ENV["UPDATE_YOUTUBE_WIDGET"]

include("./utils/patch.jl")
include("./utils/youtube.jl")

function lx_fetch(com, _)
    content = Franklin.content(com.braces[1])

    m = match(r"link\s*=\s*\"(.*?)\"", content)
    link = m.captures[1]

    r = HTTP.request("GET", link)
    if r.status == 200
        markdown = """$(String(r.body))"""
        markdown = process_markdown(markdown)
        return """$markdown"""
    else
        return """404"""
    end
end

function lx_youtubeUploadsWidget(com, _)
    if UPDATE_YOUTUBE_WIDGET == "False"
        return """"""
    end

    content = Franklin.content(com.braces[1])

    m = match(r"channel\s*=\s*\"(.*?)\"", content)
    channel = String(m.captures[1])

    recent_videos = get_recent_videos(channel; max_results=2)
    video_markdown = process_videos(recent_videos)

    return """$video_markdown"""
end
