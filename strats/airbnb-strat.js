const strat = {
  scrapePosts: scrape,
  buttonSel: 'a.facetwp-page.next',
  buttonEval: (b) => !!b
}

async function scrape(page, co) {
  await page.locator('ul.job-list').wait()
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const posts = await page.evaluate((co) => {
    return Array.from(document.querySelectorAll('ul.job-list > li'))
      .map(li => {
        const name = li
          .querySelector('h3 > a').innerText
        const href_split = li
          .querySelector('h3 > a').getAttribute('href').split('/')
        const id = href_split[href_split.length - 2]
        const locs = "New York (Remote)" // all airbnb jobs are remote
        return { co, id, name, locs }
      })
  }, co);

  return posts
}

module.exports = strat 
