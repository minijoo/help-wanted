const strat = {
  runOnce,
  scrapePosts: scrape,
  buttonSel: 'a[data-ph-at-id="pagination-next-link"]',
  buttonEval: (b) => !!b
}

async function runOnce(page) {
  await page.locator('div[aria-label="Search results"]').wait()
  await page.evaluate(() => {
    document.querySelector('div[data-ph-at-text="state"] input[data-ph-at-text="New York"]').click()
  })
  await page.locator('div[data-ph-at-text="state"] div.panel-body.aurelia-hide').wait() // this waits for filter to apply by checking if filter box has collapsed
}

async function scrape(page, co) {
  await page.locator('div[aria-label="Search results"]').wait()
  const posts = await page.evaluate((co) => {
    return Array.from(document.querySelectorAll('li.jobs-list-item'))
      .map(li => {
        const div = li.querySelector('div.information')
        const name = div.querySelector('span').innerText
        const id = div.querySelectorAll('p.job-info span.jobId > span')[1].innerText
        const postDateSpan = div.querySelector('p.job-info span.job-postdate')
        const postedOn = postDateSpan.innerText.match(/\d{2}\/\d{2}\/\d{4}/)[0]
        const locs = "New York" // we trust the filter 
        return { co, id, name, locs, postedOn }
      })
  }, co);

  return posts
}

module.exports = strat 
