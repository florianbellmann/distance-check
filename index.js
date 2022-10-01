const dotenv = require("dotenv");
const playwright = require("playwright");

dotenv.config();

(async () => {
  const destinations = process.env.TO.split(",");
  console.log("Destinations: " + destinations);

  for (let index = 0; index < destinations.length; index++) {
    const destination = destinations[index];

    console.log(destination);
    await checkDistance(destination);
    console.log("Delaying request for 15 seconds...");
    await delay(15000);
  }

  console.log("Done! Closing down.");
})();

async function checkDistance(destination) {
  console.log("Initializing headless browser for ", destination);
  const browser = await playwright.chromium.launch({
    headless: false,
    // devtools: true,
  });

  console.log("Visiting google maps for", destination);
  const page = await (await browser.newContext()).newPage();
  await page.goto("https://maps.google.com");

  console.log(`Getting directions for ${process.env.FROM} to ${destination}`);
  await page.click("button[aria-label='Routenplaner']");
  await page.fill("#directions-searchbox-0 input", process.env.FROM);
  await page.fill("#directions-searchbox-1 input", destination);
  await page.keyboard.press("Enter");

  await page.waitForLoadState("networkidle");
  await delay(15000);
  let resultInfo = await (
    await page.$("#section-directions-trip-0")
  ).innerText();
  resultInfo = resultInfo.split("\n");

  console.log("Closing headless browser for", destination);
  await browser.close();

  resultInfo && writeToDB(resultInfo,destination);
}

async function writeToDB(resultInfo,destination) {
  try {
    const date = new Date();
    const queryParams = [
      process.env.FROM,
      destination,
      resultInfo[0],
      resultInfo[1],
      resultInfo[2] + "\n" + resultInfo[3],
    ];
    const insertQueryString = `INSERT INTO distance_check(departure,destination,duration,distance,comment) VALUES ('${queryParams[0]}','${queryParams[1]}','${queryParams[2]}','${queryParams[3]}','${queryParams[4]}')`;

    const { Client } = require("pg");
    const pgClient = new Client();
    await pgClient.connect();
    await pgClient.query(insertQueryString);

    await pgClient.end();
  } catch (e) {
    console.error("Failed to write to database!", e);
  }
}

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
