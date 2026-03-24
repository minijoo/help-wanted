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
      "https://job-boards.greenhouse.io/mavenclinic",
      greenhouseStrat
    ],
    [ 
      "Numeric",
      "https://jobs.ashbyhq.com/numeric?departmentId=4307cdaa-dd4a-4dc2-905b-f3612fbb35bc",
      ashStrat 
    ],
    [ 
      "Etsy",
      "https://etsy.wd5.myworkdayjobs.com/en-US/Etsy_Careers/?State_Province_Region=9819bf0148e54f89adb255aa7bead635&jobFamilyGroup=8ed33fa0e820103da48c0bce0b4b2e10",
      workdayStrat 
    ],
  ];

module.exports = SCRAPE_TARGETS;
