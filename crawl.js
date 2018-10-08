#!/usr/bin/env node
const axios = require('axios')
const cheerio = require('cheerio')
const minimist = require('minimist')
const argv = minimist(process.argv.slice(2))

const Crawler = {
  currentCrawlLevel: undefined,
  maxCrawlLevel: 2,
  urlOriginHost: undefined,
  urlOrigin: argv['url'],
  searchTerm: argv['search'],

  init () {
    console.log(`Searching for the term ${this.searchTerm} starting at ${this.urlOrigin}`)
    this.urlOriginHost = (new URL(this.urlOrigin)).hostname
    try {
      this.startCrawl(this.urlOrigin)
    }
    catch (e) {
      console.error(e)
    }
  },

  async startCrawl (url) {
    try {
      const response = await axios.get(url)
      const $ = cheerio.load(response.data)
      const matches = $(`*:contains("${this.searchTerm}")`).last()

      if (matches[0]) { // match found
        console.log(`${url} => ${matches[0]['children'][0]['data']}`)
      }

      // Then crawl all the links
      const links = $('a')
      $(links).each((i, link) => {
        // Filter out:
        //  non same domains
        //  # anchor links?
        //  maybe use a valid url parser / regex?

        // console.log(`${url}${$(link).attr('href')}`)
        // Recursively call startCrawl
        this.startCrawl(`${url}${$(link).attr('href')}`)
      })
    }
    catch (err) {
      // console.error(`Something went wrong!`)
    }
  },

  // Checks to see if given url argument's host is the same as the origin host
  isSameHost (url) {
    return (new URL(url)).hostname === this.urlOriginHost
  }
}

Crawler.init()
