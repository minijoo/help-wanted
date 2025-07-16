const greenhouse = {
  scrapePosts: greenhouseScrape,
  buttonSel: 'button.pagination__next',
  buttonEval: (b) => b.getAttribute('aria-disabled') === 'false'
}

async function greenhouseScrape(page, co) {
  const posts = await 
    page.evaluate((co) => {
      return Array.from(document.querySelectorAll('tbody > tr.job-post'))
        .map(tr => {
          const a_href_split = tr.querySelector('a')?.getAttribute('href')?.split('/')
          const p_elements = tr.querySelectorAll('p')
          const isNew = !!p_elements[0].querySelector('span')
          return { 
            co,
            id: a_href_split[a_href_split.length - 1],
            name: p_elements[0].textContent.replace(isNew ? 'New' : '', ''),
            locs: p_elements[1].textContent,
            isNew
          }
        })
    }, co);

  return posts
}

module.exports = greenhouse

