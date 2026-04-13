const puppeteer = require('puppeteer');
const fs = require('node:fs')
const { argv } = require('node:process');
const discordJS = require('./discord.js')
const SCRAPE_TARGETS = require('./targets.js');

const MYPATH = __dirname;

function toLine({id, name, locs, postedOn, dateFirstScraped}, delim) {
  const includesNY = locs.includes('New York');
  return [id, name, includesNY, postedOn, dateFirstScraped].join(delim);
}

function insertCompanyFile(company, entries) {
  const FN = `${MYPATH}/data/${company.toLowerCase()}-data`;
  entries.sort();
  fs.writeFileSync(FN, entries.join('\n'))
  return

  //try {
  //  const ex = fs.readFileSync(FN, 'utf8');
  //  const ex_arr = ex.split('\n');
  //  ex_arr.push(...entries);
  //  ex_arr.sort();
  //  fs.writeFileSync(FN, ex_arr.join('\n'))
  //  return
  //} catch (err) {
  //  console.error(err);
  //  console.log('smth wrong w/ file or doesn`t exist; creating new');
  //}
}

async function run(arg1, companies) {
  let slowMo = parseInt(arg1);
  if (isNaN(slowMo)) 
    slowMo = 0;

  const companySet = new Set(companies);
  const pageurls = SCRAPE_TARGETS.filter(([name]) => companySet.has(name))

  const opts = {}
  
  if (slowMo > 0) {
    opts.headless = false;
    opts.slowMo = slowMo;
  }

  const browser = await puppeteer.launch(opts);

  const page = await browser.newPage();
  await page.setViewport({
    width: 1024,
    height: 768,
  });

  // page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  const arr = []
  const errors = []
  for (const [co, url, scrapeStrat] of pageurls) {
    try {
      const results = await executeScrape(page, co, url, scrapeStrat)
      arr.push(...results) //deprecate
      const header = `${co} Results`;
      const entries = results.map(jobJson => toLine(jobJson, '\t'));
      console.log(`${header}; found ${entries.length} jobs`);
      insertCompanyFile(co, entries);

  //{
  //  "co": "Adobe",
  //  "id": "R157567",
  //  "name": "Software Development Engineer",
  //  "locs": "New York",
  //  "postedOn": "07/17/2025",
  //  "dateFirstScraped": "7/17/2025, 9:34:36 PM"
  //},
    } catch (err) {
      console.error(err);
      console.log(co, 'skipped due to error')
      errors.push({co, errObj: err})
    }
  }

  const ny_arr = arr.filter(post => post.locs.toLowerCase().includes('new york'))
  ny_arr.sort(
    (a, b) => a.co.localeCompare(b.co) || b.id.localeCompare(a.id)
  )

  const companyJobs = new Map()
  for (const job of ny_arr) {
    if (!companyJobs.has(job.co)) {
      companyJobs.set(job.co, [0,0])
    }
    companyJobs.get(job.co)[0]++
  }

  let log
  try {
    log = fs.readFileSync(`${MYPATH}/logs/log.txt`)
  } catch (err) {
    console.error('no log found. terminating')
    browser.close()
    return
  }

  let contents = ''
  try {
    contents = fs.readFileSync(`${MYPATH}/files/all.json`) 
  } catch (err) {
    console.log('writing new all.json file')
    fs.writeFileSync(`${MYPATH}/files/all.json`, JSON.stringify(ny_arr, null, 2))
    console.log('no existing array. exiting early')
    browser.close()
    return
  }

  const last_arr = JSON.parse(contents) // assumes content keeps same sort order as when written
  for (const job of last_arr) {
    if (!companyJobs.has(job.co)) {
      companyJobs.set(job.co, [0,0])
    }
    companyJobs.get(job.co)[1]++
  }
  
  const merged = []
  const added = []
  let i = 0, k = 0
  const cos = pageurls.map(([co]) => co)
  while (i < ny_arr.length && k < last_arr.length) {
    let incr_i = false, incr_k = false

    if (ny_arr[i].co < last_arr[k].co) {
      merged.push(ny_arr[i])
      added.push(ny_arr[i])
      incr_i = true
    } else if (ny_arr[i].co > last_arr[k].co) {
      merged.push(last_arr[k])
      incr_k = true
    } else {
      if (ny_arr[i].id > last_arr[k].id) {
        merged.push(ny_arr[i])
        added.push(ny_arr[i])
        incr_i = true
      } else if (ny_arr[i].id < last_arr[k].id) {
        merged.push(last_arr[k])
        incr_k = true
      } else {
        merged.push(last_arr[k]) // take from here over new data to keep old time seen value
        incr_i = true
        incr_k = true
      }
    }

    if (incr_i) {
      let count = 0
      while (
        i + count < ny_arr.length && ny_arr[i + count].id === ny_arr[i].id
      ) {
        ++count
      }
      i += count
    }
    
    if (incr_k) {
      let count = 0
      while (
        k + count < last_arr.length && last_arr[k + count].id === last_arr[k].id
      ) {
        ++count
      }
      k += count
    }
  } 

  while (i < ny_arr.length) {
    merged.push(ny_arr[i])
    added.push(ny_arr[i++])
  }

  while (k < last_arr.length) {
    merged.push(last_arr[k++])
  }
 
  console.log("added", added.length)

  let currlog = 
    '-------------' 
    + (new Date()).toLocaleString("en-US", { timeZone: "America/New_York" })
    + '-------------\n'
  currlog += `Added ${added.length} new jobs\n`
  currlog += added.map(j => `${j.co}, ${j.id}, ${j.name}, ${j.locs}`).join('\n')
  if (errors.length) {
    currlog += '\n'
    currlog += `Errors: ${errors.length} errors\n`
    currlog += errors.map(
      err => `${err.co} \n\t ${err.errObj.name} - ${err.errObj.message} \n\t ${err.errObj.stack}`
    ).join('\n')
  }  

  currlog += '\n\n'
  currlog += log

  try {
    //const toWrite = last_arr.filter(j => !cos.includes(j.co))
    //toWrite.push(...ny_arr)
    //toWrite.sort((a, b) => a.co.localeCompare(b.co) || b.id.localeCompare(a.id))
    fs.writeFileSync(`${MYPATH}/files/all.json`, JSON.stringify(merged, null, 2))
    console.log('all.json updated')
  } catch (err) {
    console.log('error! writing to all.json. losing data from this scrape. exiting.')
  }

  try {
    fs.writeFileSync(`${MYPATH}/logs/log.txt`, currlog)
    console.log('log updated')
  } catch (err) {
    console.log('error! writing to logs.txt. printing log instead')
    console.log(currlog)
  }

  try {
    discordJS.sendMessage(`Job completed: Added ${added.length} (from mac)`)
    if (added.length) {
      let discordMsg = 'Added:\n'
      discordMsg += added.slice(0, 15).map(j => `● ${j.co} | ${j.name} (${j.id}) \n\`     \`${j.locs}`).join('\n')
      discordJS.sendMessage('Here are the jobs that were added', 'Co. | Role (Id) [showing only 15 results]', discordMsg)
    }
  } catch (err) {
    console.log('error! sending discord message')
    console.log(err)
  }

  for (const [co] of pageurls) {
    const counts = companyJobs.get(co)
    console.log(co, ":", counts ? `${counts[0]} / ${counts[1]}` : "0 / 0");
  }

  browser.close();
}

async function executeScrape(page, co, url, scrapeStrat) {
  const results = []
  await page.goto(url, { waitUntil: 'load' });

  const now = (new Date()).toLocaleString("en-US", { timeZone: "America/New_York" })

  scrapeStrat.runOnce && await scrapeStrat.runOnce(page) 

  const posts = await scrapeStrat.scrapePosts(page, co)
  posts.forEach(p => {
    p.dateFirstScraped = now
  })
  results.push(...posts)

  let buttonExists = await page.$(scrapeStrat.buttonSel)
  //buttonExists && await buttonExists.scrollIntoView() 
  const button = page.locator(scrapeStrat.buttonSel);
  let isNotLastPage = buttonExists && (await button.map(scrapeStrat.buttonEval).wait());

  let pagenum = 1
  while (isNotLastPage && pagenum < 3) {
    const [response] = await Promise.all([
      page.waitForNavigation({ waitUntil: 'load' }),
      page.evaluate(sel => {
        document.querySelector(sel).click()
      }, scrapeStrat.buttonSel)
    ]);

    const posts = await scrapeStrat.scrapePosts(page, co)
    posts.forEach(p => {
      p.dateFirstScraped = now
    })
    results.push(...posts)
    
    buttonExists = await page.$(scrapeStrat.buttonSel)
    //buttonExists && await buttonExists.scrollIntoView()
    isNotLastPage = buttonExists && (await button.map(scrapeStrat.buttonEval).wait());
    ++pagenum
  } 
  return results
}

if (argv.length < 4) {
  console.error("At least two arguments required");
  return;
}

const args = argv.filter((_, i) => i > 1)

run(argv[2], args);
