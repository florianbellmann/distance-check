const dotenv = require("dotenv");
const playwright = require("playwright");


dotenv.config();

(async () => {
  console.log("Initializing headless browser");
  const browser = await playwright.chromium.launch({
    headless: false,
    // devtools: true,
  });

  console.log("Visiting google maps");
  const page = await (await browser.newContext()).newPage();
  await page.goto("https://maps.google.com");

  console.log(
    `Getting directions for ${process.env.FROM} to ${process.env.TO}`
  );
  await page.click("button[aria-label='Directions']");
  await page.fill("#directions-searchbox-0 input", process.env.FROM);
  await page.fill("#directions-searchbox-1 input", process.env.TO);
  await page.keyboard.press("Enter");

  console.log("Scraping results");
  await page.waitForLoadState("networkidle");
  await delay(5000);
  let resultInfo = await (
    await page.$("#section-directions-trip-0")
  ).innerText();
  resultInfo = resultInfo.split("\n")

  // console.debug("resultInfo", resultInfo);

  console.log("Writing to database");
  await writeToDB(resultInfo);

  console.log("Closing headless browser");
  await browser.close();
})();


async function writeToDB(entry) {
  try {

    const date = new Date()
    const queryParams = [
      process.env.FROM,
      process.env.TO,
      entry[0],
      entry[1],
      entry[2] + "\n" + entry[3],
      date.toLocaleString("de-DE", { timeZone: "Europe/Berlin" })
    ]
    const insertQueryString = `INSERT INTO travel_time VALUES ('${queryParams[0]}','${queryParams[1]}','${queryParams[2]}','${queryParams[3]}','${queryParams[4]}','${queryParams[5]}')`

    const { Client } = require('pg')
    const pgClient = new Client()
    await pgClient.connect()
    await pgClient.query(insertQueryString)

    await pgClient.end()
  } catch (e) {
    console.error("Failed to write to database!", e)
  }
}

function delay(time) {
  return new Promise(function(resolve) {
    setTimeout(resolve, time);
  });
}
