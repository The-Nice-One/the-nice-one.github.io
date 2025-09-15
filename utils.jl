using HTTP

function hfun_bar(vname)
    val = Meta.parse(vname[1])
    return round(sqrt(val), digits=2)
end

function hfun_m1fill(vname)
    var = vname[1]
    return pagevar("index", var)
end

function lx_baz(com, _)
    # keep this first line
    brace_content = Franklin.content(com.braces[1]) # input string
    # do whatever you want here
    return uppercase(brace_content)
end

const IMAGE_PATTERN = r"!\[([^\]]*)\]\(([^\s\)]+)(?:\s+[\"']([^\"']*)[\"'])?\)"
const HEADER_PATTERN = r"^(\#{1,6})\s+(.+?)(?:\s*\#*)?$"m
const CODE_BLOCK_PATTERN = r"```[\s\S]*?```"m

function replace_image(string)
    result = match(IMAGE_PATTERN, string)

    image_name = result.captures[1]
    image_link = result.captures[2]

    if startswith(image_name, "emoji")
        return "\\linkedEmoji{$image_link}"
    else
        return "![$image_name]($image_link)"
    end
end

function replace_header(string)
    result = match(HEADER_PATTERN, string)

    header_level = length(result.captures[1])
    header_text = result.captures[2]
    anchor_text = lowercase(header_text)
    anchor_text = replace(anchor_text, " " => "-")
    anchor_text = replace(anchor_text, "." => "")
    anchor_text = replace(anchor_text, "," => "")
    anchor_text = replace(anchor_text, "?" => "")
    anchor_text = replace(anchor_text, "'" => "")
    anchor_text = replace(anchor_text, "&" => "")

    return "\\header{$header_text}{$anchor_text}"
end

function lx_banner(com, _)
    content = Franklin.content(com.braces[1])

    m = match(r"icon\s*=\s*\"(.*?)\"\s*text\s*=\s*\"(.*?)\"", content)
    icon, text = m.captures[1:2]

end

function replace_hard_coded(string)
    markdown = replace(
        string,
        "# ![bannerAboutMe](https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/banners/aboutMe.png)"
        => "\\iconHeader{https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/icons/aboutMe.png}{About Me}{about-me}"
    )
    markdown = replace(
        markdown,
        "# ![bannerExperience](https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/banners/experience.png)"
        => "\\iconHeader{https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/icons/experience.png}{Experience}{experience}"
    )
    markdown = replace(
        markdown,
        "# ![bannerUpcoming](https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/banners/upcoming.png)"
        => "\\iconHeader{https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/icons/upcoming.png}{Upcoming}{upcoming}"
    )
    return markdown
end

function process_markdown(string)
    code_blocks = []
    templated_markdown = string

    counter = 1
    for m in eachmatch(CODE_BLOCK_PATTERN, string)
        placeholder = "{{codeblock$counter}}"
        push!(code_blocks, (placeholder, m.match))
        templated_markdown = replace(templated_markdown, m.match => placeholder)
        counter += 1
    end

    templated_markdown = replace_hard_coded(templated_markdown)
    templated_markdown = replace(templated_markdown, IMAGE_PATTERN => replace_image)
    templated_markdown = replace(templated_markdown, HEADER_PATTERN => replace_header)

    markdown = templated_markdown
    for (placeholder, code_block) in code_blocks
        markdown = replace(markdown, placeholder => code_block)
    end

    return markdown
end

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
