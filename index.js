const puppeteer = require('puppeteer');
const fs = require('node:fs')
const discordJS = require('./discord.js')
const greenhouseStrat = require('./strats/greenhouse-strat.js')
const workdayStrat = require('./strats/workday-strat.js')
const disneyStrat = require('./strats/disney-strat.js')
const salesforceStrat = require('./strats/salesforce-strat.js')
const pinterestStrat = require('./strats/pinterest-strat.js')
const adobeStrat = require('./strats/adobe-strat.js')
const airbnbStrat = require('./strats/airbnb-strat.js')
const ashStrat = require('./strats/ash-strat.js')
const leverStrat= require('./strats/lever-strat.js')
const mastercardStrat = require('./strats/mastercard-strat.js')

async function run() {
  const _pageurls = [
    [ 
      "Numeric",
      "https://jobs.ashbyhq.com/numeric?departmentId=4307cdaa-dd4a-4dc2-905b-f3612fbb35bc",
      ashStrat 
    ],
  ]

  const pageurls = SCRAPE_TARGETS 

  const browser = await puppeteer.launch({
    //headless: false,
    //slowMo: 200
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1024,
    height: 768,
  });

  //page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  const arr = []
  const errors = []
  for (const [co, url, scrapeStrat] of pageurls) {
    try {
      const results = await executeScrape(page, co, url, scrapeStrat)
      arr.push(...results)
    } catch (err) {
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
    log = fs.readFileSync('./logs/log.txt')
  } catch (err) {
    console.error('no log found. terminating')
    browser.close()
    return
  }

  let contents = ''
  try {
    contents = fs.readFileSync('./files/all.json') 
  } catch (err) {
    console.log('writing new all.json file')
    fs.writeFileSync('./files/all.json', JSON.stringify(ny_arr, null, 2))
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
    fs.writeFileSync('./files/all.json', JSON.stringify(merged, null, 2))
    console.log('all.json updated')
  } catch (err) {
    console.log('error! writing to all.json. losing data from this scrape. exiting.')
  }

  try {
    fs.writeFileSync('./logs/log.txt', currlog)
    console.log('log updated')
  } catch (err) {
    console.log('error! writing to logs.txt. printing log instead')
    console.log(currlog)
  }

  try {
    discordJS.sendMessage(`Job completed: Added ${added.length}`)
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

const SCRAPE_TARGETS =  
  [
    [
      "Adobe", 
      "https://careers.adobe.com/us/en/c/engineering-and-product-jobs?s=1",
      adobeStrat 
    ],
    [
      "Snap", 
      "https://wd1.myworkdaysite.com/en-US/recruiting/snapchat/snap/jobs?jobFamily=8d73f0a7971d102b9d459841e16ae3a5&locations=256f279d5e741082c567c24fca236272&locations=efe1a865073101b9db6c8da7020a6037",
      workdayStrat
    ],
    [
      "Disney",
      "https://www.disneycareers.com/en/search-jobs/software%20engineer/New%20York,%20NY/391/1/4/6252001-5128638-5128581/40x7128/-74x006/100/2",
      disneyStrat
    ],
    [
      "Rakuten",
      "https://rakuten.wd1.myworkdayjobs.com/RakutenRewards?jobFamily=c37e417fc77e01c2614f27b127003100&locations=35e06daa025301eab0ce91150202f3d8",
       workdayStrat
    ],
    [
      "Clear", 
      "https://job-boards.greenhouse.io/clear?departments%5B%5D=42447",
      greenhouseStrat 
    ],
    [
      "Twitch", 
      "https://job-boards.greenhouse.io/twitch?departments%5B%5D=4036629002",
      greenhouseStrat 
    ], 
    [
      "DoorDash", 
      "https://job-boards.greenhouse.io/doordashusa?departments%5B%5D=2438",
      greenhouseStrat
    ],
    [
      "StubHub", 
      "https://job-boards.eu.greenhouse.io/stubhubinc?departments%5B%5D=4034328101&offices%5B%5D=4016791101",
      greenhouseStrat
    ],
    [ 
      "AirBnb",
      "https://careers.airbnb.com/positions/?_departments=engineering&_offices=united-states",
      airbnbStrat
    ],
    [ 
      "Ramp",
      "https://jobs.ashbyhq.com/ramp?departmentId=e9877d64-61b1-4b37-8518-65af0431cd09",
      ashStrat 
    ],
    [ 
      "OpenAI",
      "https://jobs.ashbyhq.com/openai?locationId=07ed9191-5bc6-421b-9883-f1ac2e276ad7",
      ashStrat 
    ],
    [ 
      "Oso",
      "https://jobs.ashbyhq.com/Oso?departmentId=8278fb2d-8fa2-4698-831a-b0b2320e9486",
      ashStrat 
    ],
    [ 
      "Rockstar",
      "https://job-boards.greenhouse.io/rockstargames?offices%5B%5D=4003596003&departments%5B%5D=4006322003",
      greenhouseStrat
    ],
    [ 
      "Mastercard",
      "https://careers.mastercard.com/us/en/search-results",
      mastercardStrat
    ],
    [ 
      "Matchgroup",
      "https://jobs.lever.co/matchgroup/?location=New%20York%2C%20New%20York",
      leverStrat
    ],
    [ 
      "Plaid",
      "https://jobs.lever.co/plaid/?location=New%20York&department=Engineering&team=Engineering",
      leverStrat
    ],
    [ 
      "Maven",
      "https://job-boards.greenhouse.io/mavenclinic?gh_src=e11878472us",
      greenhouseStrat
    ],
    [ 
      "Numeric",
      "https://jobs.ashbyhq.com/numeric?departmentId=4307cdaa-dd4a-4dc2-905b-f3612fbb35bc",
      ashStrat 
    ],
  ];

run();
