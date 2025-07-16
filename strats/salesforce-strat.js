const salesforce = {
  scrapePosts: salesforceScrape,
  buttonSel: 'a[aria-label="Next page"]',
  buttonEval: (b) => !!b
}

async function salesforceScrape(page, co) {
  await page.locator('div.job-listing > div.card-job').wait()
  const [response] = await Promise.all([
    page.waitForNavigation({ waitUntil: 'load' }),
    page.click('button#js-main-job-search')
  ]);
  const posts = await 
    page.evaluate((co) => {
      return Array.from(document.querySelectorAll('div.job-listing > div.card-job'))
        .map(div => {
          const a_elem = div.querySelector('div > h3 > a')
          const a_href_split = a_elem.getAttribute('href').split('/')
          const name = a_elem.textContent
          const locs = Array.from(div.querySelectorAll('div > ul > li > ul > li')).map(li => li.textContent).join(",")
          return { co, id: a_href_split[3], name, locs }
        })
    }, co);

  return posts
}

module.exports = salesforce
