const disney = {
  scrapePosts: disneyScrape,
  buttonSel: 'a.next',
  buttonEval: (b) => !!b
}

async function disneyScrape(page, co) {
  await page.locator('section#search-results-list').wait()
  await page.select('p.search-results-enhanced-sort-criteria > select', "11")
  const posts = await 
    page.evaluate((co) => {
      return Array.from(document.querySelectorAll('section#search-results-list > ul > li'))
        .map(li => {
          const a_elem = li.querySelector('a')
          const a_href_split = a_elem.getAttribute('href').split('/')
          const name = a_elem.querySelector('h2').textContent
          const locs = a_elem.querySelectorAll('span')[1].textContent
          return { co, id: a_href_split[6], name, locs }
        })
    }, co);

  return posts
}

module.exports = disney
