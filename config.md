<!--
Add here global page variables to use throughout your website.
-->
+++
author = "The-Nice-One"
mintoclevel = 2

# uncomment and adjust the following line if the expected base URL of your website is something like [www.thebase.com/yourproject/]
# please do read the docs on deployment to avoid common issues: https://franklinjl.org/workflow/deploy/#deploying_your_website
# prepath = "yourproject"

# Add here files or directories that should be ignored by Franklin, otherwise
# these files might be copied and, if markdown, processed by Franklin which
# you might not want. Indicate directories by ending the name with a `/`.
# Base files such as LICENSE.md and README.md are ignored by default.
ignore = ["node_modules/"]

# RSS (the website_{title, descr, url} must be defined to get RSS)
generate_rss = false
website_title = "The-Nice-One"
website_descr = "Example website using Franklin"
website_url   = "https://tlienart.github.io/FranklinTemplates.jl/"
+++

<!--
Add here global latex commands to use throughout your pages.
-->
\newcommand{\R}{\mathbb R}
\newcommand{\scal}[1]{\langle #1 \rangle}

\newcommand{\linkedEmoji}[1]{~~~<img style="max-width: 1rem; padding-left: 0; image-rendering: pixelated;" src="#1" alt="#1">~~~}
\newcommand{\emoji}[1]{~~~<img style="max-width: 1rem; padding-left: 0; image-rendering: pixelated;" src="https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/emojis/!#1.png" alt="https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/emojis/!#1.png">~~~}
\newcommand{\largeEmoji}[1]{~~~<img style="max-width: 2rem; padding-left: 0; image-rendering: pixelated;" src="https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/emojis/!#1.png" alt="https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/emojis/!#1.png">~~~}

\newcommand{\iconHeader}[3]{\label{!#3} ~~~<div class="banner"><a href="#!#3"><img class="anchor-icon" style="max-width: 3rem; padding-left: 0; image-rendering: pixelated; margin-right:0.2rem" src="#1" alt="#1"><spf-text class="spf-process-blue">!#2</spf-text></a></div>~~~}
\newcommand{\header}[2]{\label{!#2} ~~~<div class="banner"><a href="#!#2"><img class="anchor-icon" style="max-width: 3rem; padding-left: 0; image-rendering: pixelated; margin-right:0.2rem" src="https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/icons/link.png" alt="https://raw.githubusercontent.com/The-Nice-One/GalleryArt/refs/heads/main/icons/link.png"><spf-text class="spf-process-blue">!#1</spf-text></a></div>~~~}

\newcommand{\pixelImage}[1]{~~~<img style="max-width: 100%; padding-left: 0; image-rendering: pixelated;" src="#1" alt="#1">~~~}
