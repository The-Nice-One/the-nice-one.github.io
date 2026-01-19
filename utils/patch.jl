const IMAGE_PATTERN = r"!\[([^\]]*)\]\(([^\s\)]+)(?:\s+[\"']([^\"']*)[\"'])?\)"
const HEADER_PATTERN = r"^(\#{1,6})\s+(.+?)(?:\s*\#*)?$"m
const CODE_BLOCK_PATTERN = r"```[\s\S]*?```"m
OPEN_WORKS_CITED_DIV = false

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
    global OPEN_WORKS_CITED_DIV
    result = match(HEADER_PATTERN, string)

    works_cited_pretext = ""
    if OPEN_WORKS_CITED_DIV
        OPEN_WORKS_CITED_DIV = false
        works_cited_pretext = "@@\n"
    end

    header_level = length(result.captures[1])
    header_text = result.captures[2]
    anchor_text = lowercase(header_text)
    anchor_text = replace(anchor_text, " " => "-")
    anchor_text = replace(anchor_text, "." => "")
    anchor_text = replace(anchor_text, "," => "")
    anchor_text = replace(anchor_text, "?" => "")
    anchor_text = replace(anchor_text, "'" => "")
    anchor_text = replace(anchor_text, "&" => "")

    works_cited_posttext = ""
    if header_text == "Works Cited"
        OPEN_WORKS_CITED_DIV = true
        works_cited_posttext = "\n@@box-works-cited"
    end

    return "$works_cited_pretext\\header{$header_text}{$anchor_text}$works_cited_posttext"
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
    global OPEN_WORKS_CITED_DIV

    code_blocks = []
    templated_markdown = string

    counter = 1
    for m in eachmatch(CODE_BLOCK_PATTERN, string)
        placeholder = "{{codeblock$counter}}"

        lines = split(m.match, "\n")
        language = lines[1][4:end]
        code = join(lines[2:end-1], "\n")

        if language == "mermaid"
            mermaid_md = "~~~\n<pre class=\"mermaid\">\n$code\n</pre>\n~~~"
            push!(code_blocks, (placeholder, mermaid_md))
        else
            push!(code_blocks, (placeholder, m.match))
        end


        templated_markdown = replace(templated_markdown, m.match => placeholder)
        counter += 1
    end

    templated_markdown = replace_hard_coded(templated_markdown)
    templated_markdown = replace(templated_markdown, IMAGE_PATTERN => replace_image)
    templated_markdown = replace(templated_markdown, HEADER_PATTERN => replace_header)
    if OPEN_WORKS_CITED_DIV
        OPEN_WORKS_CITED_DIV = false
        templated_markdown *= "\n@@"
    end

    markdown = templated_markdown
    for (placeholder, code_block) in code_blocks
        markdown = replace(markdown, placeholder => code_block)
    end

    return markdown
end
