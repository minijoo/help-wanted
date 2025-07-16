const strat = {
  scrapePosts: scrape,
  buttonSel: 'li.next > a',
  buttonEval: (b) => !!b
}

async function scrape(page, co) {
  await page.locator('div.job-listing > div.card-job').wait()
  const posts = await 
    page.evaluate((co) => {
      return Array.from(document.querySelectorAll('div.job-listing > div.card-job'))
        .map(div => {
          const a_elem = div.querySelector('div > h2 > a')
          const a_href_split = a_elem.getAttribute('href').split('/')
          const name = a_elem.textContent
          const locs = "Remote (New York)" // all pinterest jobs are remote
          return { co, id: a_href_split[2], name, locs }
        })
    }, co);

  return posts
}

module.exports = strat 
