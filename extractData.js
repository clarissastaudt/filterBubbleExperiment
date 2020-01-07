const glob = require("glob")
const puppeteer = require('puppeteer');
const fs = require('fs');


function writeData(outputString, path) {
    fs.writeFile(path, outputString, function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("The file was saved!");
  });
}

function createOutputString(output) {
    let outputString = "ID;Ergebnisse;Links;Journalistisch;Link1;Link2;Link3;Link4;Link5;Link6;Link7;Link8;Link9;Link10;Link11;Link12;Link13;Link14;Link15;Link16;Link17;Link18;Link19;Link20;Link21;Link22;Link23;Link24;Link25;Link26;Link27;Link28;Link29;Link30;Link31;Link32;Link33;Link34;Link35;Link36;Link37;Link38;Link39;Link40;Link41;Link42;Link43;Link44;Link45;Link46;Link47;Link48;Link49;Link50;"

    for (let i = 0; i < output.length; i++) {
        let journalistic = 0
        for (let j = 0; j < output[i].links.length; j++) {
            let link = output[i].links[j]
            if (link.includes("theguardian.com") || link.includes("merkur.de") || link.includes("stuttgarter-nachrichten.de") || link.includes("dw.com") || link.includes("augsburger-allgemeine.de") || link.includes("tagesschau.de") || link.includes("taz.de") || link.includes("zeit.de") || link.includes("tz.de") || link.includes("welt.de") || link.includes("focus.de") || link.includes("landeszeitung.de") || link.includes("waz.de") || link.includes("tagblatt.de") || link.includes("t-online.de") || link.includes("rnd.de") || link.includes("zdf.de") || link.includes("web.de/magazine") || link.includes("bild.de") || link.includes("faz.de") || link.includes("fr-online") || link.includes("sueddeutsche.de") || link.includes("neues-deutschland.de") || link.includes("berliner-zeitung.de") || link.includes("badische-zeitung.de") || link.includes("donaukurier.de") || link.includes("bz-berlin.de") || link.includes("spiegel.de") || link.includes("fr.de")|| link.includes("derwesten.de")|| link.includes("deutschlandfunk.de") || link.includes("maz-online.de") || link.includes("wp.de") || link.includes("stern.de") || link.includes("stuttgarter-nachrichten.de") || link.includes("br.de") || link.includes("abendblatt.de") || link.includes("ndr.de") || link.includes("sn-online.de")) {
                journalistic += 1
            }
        }

        // Create outputString
        let row = output[i].id + ";" + output[i].ergebnisse + ";" + output[i].links.length + ";" + journalistic + ";" + output[i].links.join(";")
        outputString = outputString + "\n" + row
    }
    return(outputString)
}

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

      // Check links for each file
      for (let i = 0; i < files.length; i++) {
          console.log(files[i])

          let path = "file:///C:/Users/clari/Desktop/Referat_Wikomm_online/" + files[i]
          await page.goto(path);

          let data = await page.evaluate(() => {
              let ergebnisse = document.getElementById("resultStats").innerText.split(".").join("")
              ergebnisse = ergebnisse.match(/\d+/)[0]

              // collect all links on page
              let a = document.querySelectorAll("a")
              let links = []
              for (let i = 0; i < a.length; i++) {
                  let link = a[i].href
                  if (!link.match(/google/) && link != "" && link != "https://www.iptc.org/" && link.substring(0,5) != "file:" && link !=  'https://www.youtube.com/results?gl=DE&tab=w10' && link != 'https://www.blogger.com/?tab=wj0') {
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
      console.log(output)

      let outputString = createOutputString(output)
      writeData(outputString, "data_per_observation.csv")

      let uniqueLinks = findUniqueLinks(output)
      let linksForEachObservation = countLinksForEachObservation(output, uniqueLinks)
      writeData(linksForEachObservation, "links_per_observation.csv")


      await browser.close();
  })

})();
