const strat = {
  scrapePosts: scrape,
  buttonSel: 'button.pagination__next',
  buttonEval: (b) => false
}

async function scrape(page, co) {
  const posts = await 
    page.evaluate((co) => {
      return Array.from(document.querySelectorAll('div.ashby-job-posting-brief-list > a'))
        .map(a => {
          let id = a.getAttribute('href').split('/')[2]
          id = id.substring(0, id.indexOf('?'))
          const name = a.querySelector('h3').innerText
          const locs = a.querySelector('div > div > p').innerText
          return { co, id, name, locs }
        })
    }, co);

  return posts
}

module.exports = strat

