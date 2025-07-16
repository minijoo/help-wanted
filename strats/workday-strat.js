const workday = {
  scrapePosts: workdayScrape,
  buttonSel: 'button[aria-label=next]',
  buttonEval: (b) => !!b
}

async function workdayScrape(page, co) {
  await page.locator('section[data-automation-id="jobResults"] > ul > li').wait()
  const posts = await page.evaluate((co) => 
    {
      const lis = document.querySelectorAll('section[data-automation-id="jobResults"] > ul > li')
      return Array.from(lis)
        .map(li => {
          const id = li.querySelector('ul > li').textContent
          const name = li.querySelector('h3').textContent
          const locs = "New York" // we trust the site filter on workday
          return { co, id, name, locs }
        })
    }, co);

  return posts
}

module.exports = workday
