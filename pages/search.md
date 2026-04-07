---
title: Search
---

\header{Search Results}{search-results}

<div id="search"></div>

<script>
window.addEventListener('DOMContentLoaded', () => {
  const ui = new PagefindUI({
    element: '#search',
    showSubResults: true,
  })

  // Read ?q= from the URL and pre-populate the search
  const params = new URLSearchParams(window.location.search)
  const query = params.get('q')
  if (query) {
    ui.triggerSearch(query)
  }
})
</script>

<style>
#lunrSearchForm {
    display: None;
}
</style>
