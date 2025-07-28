const strat = {
  scrapePosts: scrape,
  buttonSel: 'button.pagination__next',
  buttonEval: (b) => false
}

async function scrape(page, co) {
  const posts = await 
    page.evaluate((co) => {
      return Array.from(document.querySelectorAll('div.posting'))
        .map(div => {
          let id = div.querySelector('a').getAttribute('href').split('/')
          id = id[id.length - 1]
          const name = div.querySelector('h5').innerText
          const locs = div.querySelector('span.location').innerText
          return { co, id, name, locs }
        })
    }, co);

  return posts
}

module.exports = strat

