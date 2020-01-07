/*
* IMPORTS
*/
const glob = require("glob")
const puppeteer = require('puppeteer');
const fs = require('fs');


/*
* Writes string to given path.
* @param {String} outputString
* @param {String} path
* @return {}
*/
function writeData(outputString, path) {
    fs.writeFile(path, outputString, function(err) {
      if(err) {
          return console.log(err);
      }
      let message = "File " + path + " saved!"
      console.log(message);
  });
}

/*
* Creates a csv header counting 50 links
* @param {}
* @return {String} linkHeader
*/
function createLinkHeader() {
    let linkHeader = []
    for (let i = 1; i <= 50; i++){
      linkHeader.push("Link" + i)
    }
    return(linkHeader.join(";"))
}

/*
* Checks if a link includes domain name known for journalistic content
* @param {String} link
* @return {Boolean} linkIncludes
*/
function checkLinkIncludes(link) {
    let links = ["sn-online.de", "ndr.de", "abendblatt.de", "br.de", "stuttgarter-nachrichten.de", "stern.de", "wp.de", "maz-online.de", "deutschlandfunk.de", "derwesten.de", "fr.de", "spiegel.de", "krautreporter.de", "bz-berlin.de", "donaukurier.de", "badische-zeitung.de", "berliner-zeitung.de", "neues-deutschland.de", "sueddeutsche.de", "fr-online", "faz.de", "bild.de", "zdf.de", "theguardian.com", "merkur.de", "stuttgarter-nachrichten.de", "dw.com", "augsburger-allgemeine.de", "tagesschau.de", "taz.de", "zeit.de", "tz.de", "welt.de", "focus.de", "landeszeitung.de", "waz.de", "tagblatt.de", "t-online.de", "rnd.de"]
    let linkIncludes = false
    for (let i = 0; i < links.length;  i++) {
        if (link.includes(links[i])) {
            linkIncludes = true
        }
    }
    return(linkIncludes)
}

/*
* Creates an outputstring (csv format) from the crawled output
* @param {Object} output
* @return {String} outputString
*/
function createOutputString(output) {
    let linkHeader = createLinkHeader()
    let outputString = "ID;Ergebnisse;Links;Journalistisch;" + linkHeader

    for (let i = 0; i < output.length; i++) {
        let journalistic = 0
        for (let j = 0; j < output[i].links.length; j++) {
            let link = output[i].links[j]
            if (checkLinkIncludes(link)) {
                journalistic += 1
            }
        }
        // Create outputString
        let row = output[i].id + ";" + output[i].ergebnisse + ";" + output[i].links.length + ";" + journalistic + ";" + output[i].links.join(";")
        outputString = outputString + "\n" + row
    }
    return(outputString)
}

/*
* Creates an array containing unique  links
* @param {Array} names
* @return {Array} targetFolders
*/
function findUniqueLinks(output) {
    let linklist = []
    for (let i = 0; i < output.length; i++) {
        for (let j = 0; j < output[i].links.length; j++) {
            let link = output[i].links[j]
            linklist.push(link)
        }
    }
    let uniqueLinks = Array.from(new Set(linklist))
    return(uniqueLinks)
}

/*
* Creates an outputstrinng (csv format) with counts for each unique link.
* @param {Object} output
* @param {Array} uniqueLinks
* @return {String} outputString
*/
function countLinksForEachObservation(output, uniqueLinks) {
    let outputString = "ID;" + uniqueLinks.join(";")
    for (let i = 0; i < output.length; i++) {
        let countLinks = new Array(uniqueLinks.length).fill(0)
        for (let j = 0; j < output[i].links.length; j++) {
            let link = output[i].links[j]
            if (uniqueLinks.indexOf(link) != -1) {
                countLinks[uniqueLinks.indexOf(link)] += 1
            }
        }
        outputString += "\n" + output[i].id + ";" + countLinks.join(";")
    }
    return(outputString)
}

(async () => {
  var output = []
  glob("data/*.html", async (er, files) => {
      const browser = await puppeteer.launch({headless: true});
      const page = await browser.newPage();
      console.log("Processing:")

      // Check links for each file
      for (let i = 0; i < files.length; i++) {
          console.log("- " + files[i])

          // TODO: hard coded !!!
          let path = "file:///C:/Users/clari/Desktop/Referat_Wikomm_online/" + files[i]
          await page.goto(path);

          let data = await page.evaluate(() => {
              // Ergebnisse: Number of items found by google
              let ergebnisse = document.getElementById("resultStats").innerText.split(".").join("")
              ergebnisse = ergebnisse.match(/\d+/)[0]

              // Collect all links on page
              let a = document.querySelectorAll("a")
              let links = []
              for (let i = 0; i < a.length; i++) {
                  let link = a[i].href
                  // Links should not lead to google products
                  if (!link.match(/google/) && link != "" && link != "https://www.iptc.org/" && link.substring(0,5) != "file:" && link !=  'https://www.youtube.com/results?gl=DE&tab=w10' && link != 'https://www.blogger.com/?tab=wj') {
                      links.push(link)
                  }
              }

              let data = {
                  ergebnisse: ergebnisse,
                  links: links
              }

              return(data)
          })
          let idString = files[i].slice(5)
          data.id = idString.substring(0, idString.length - 5);
          output.push(data)
      }

      console.log("\nCreating output...")

      let outputString = createOutputString(output)
      writeData(outputString, "data_per_observation.csv")

      let uniqueLinks = findUniqueLinks(output)
      let linksForEachObservation = countLinksForEachObservation(output, uniqueLinks)
      writeData(linksForEachObservation, "links_per_observation.csv")


      await browser.close();
  })

})();
