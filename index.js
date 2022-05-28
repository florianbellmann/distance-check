const dotenv = require("dotenv");
const playwright = require("playwright");

dotenv.config();

(async () => {
  console.log("Initializing headless browser");
  const browser = await playwright.chromium.launch({
    // headless: false,
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
  resultInfo = resultInfo.split("\n").pop();

  console.log("resultInfo", resultInfo);

  console.log("Closing headless browser");
  await browser.close();
})();

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
