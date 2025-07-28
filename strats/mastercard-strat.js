const strat = {
  runOnce,
  scrapePosts: scrape,
  buttonSel: 'a.next-btn:not(.aurelia-hide)',
  buttonEval: (b) => !!b
}

async function runOnce(page) {
  await page.locator('ul[data-ph-at-id="jobs-list"]').wait()
  await page.evaluate(() => {
    document.querySelector('div[data-ph-at-id="facet-category"] input[data-ph-at-text="Software Engineering"]').click()
  })
  await page.locator('ul[data-ph-at-id="jobs-list"]').wait()
  await page.evaluate(() => {
    document.querySelector('div[data-ph-at-id="facet-city"] input[data-ph-at-text="New York"').click()
  })
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

async function scrape(page, co) {
  await page.locator('ul[data-ph-at-id="jobs-list"]').wait()
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const posts = await page.evaluate((co) => {
    return Array.from(document.querySelectorAll('li.jobs-list-item'))
      .map(li => {
        //console.log(li)
        const div = li.querySelector('div.information')
        const name = div.querySelector('span').innerText
        const id = div.querySelectorAll('p.job-info span.jobId > span')[1].innerText
        const locs = div.querySelector('p.job-info span.job-location').innerText
        return { co, id, name, locs }
      })
  }, co);

  return posts
}

module.exports = strat 
