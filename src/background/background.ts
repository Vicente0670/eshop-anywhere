import { IsDev, Keys } from "../Constants.ts";

const tabQueryOptions: chrome.tabs.QueryInfo = {
  windowType: "normal",
  status: "complete",
  url: [
    "https://*.amazon.ae/*", // United Arab Emirates
    "https://*.amazon.ca/*", // Canada
    "https://*.amazon.co.jp/*", // Japan
    "https://*.amazon.co.uk/*", // UK
    "https://*.amazon.co.za/*", // South Africa
    "https://*.amazon.com/*", // US
    "https://*.amazon.com.au/*", // Australia
    "https://*.amazon.com.be/*", // Belgium
    "https://*.amazon.com.br/*", // Brazil
    "https://*.amazon.com.mx/*", // Mexico
    "https://*.amazon.com.tr/*", // Turkey
    "https://*.amazon.de/*", // Germany
    "https://*.amazon.eg/*", // Egypt
    "https://*.amazon.es/*", // Spain
    "https://*.amazon.fr/*", // France
    "https://*.amazon.ie/*", // Ireland
    "https://*.amazon.in/*", // India
    "https://*.amazon.it/*", // Italy
    "https://*.amazon.nl/*", // Netherlands
    "https://*.amazon.pl/*", // Poland
    "https://*.amazon.sa/*", // Saudi Arabia
    "https://*.amazon.sg/*", // Singapore
  ]
}

let creatingDocument: null | void;

async function spawnDocument(tabs: chrome.tabs.Tab[]) {
  // Only one context will ever be needed of Keys.OffscreenURL
  const contextOptions: chrome.runtime.ContextFilter = {
    contextTypes: ["OFFSCREEN_DOCUMENT"]
  };
  const contextPresent = (await chrome.runtime.getContexts(contextOptions)).length > 0;

  if (!tabs || tabs.length == 0) {
    if (contextPresent)
      return await chrome.offscreen.closeDocument();
    return true;
  }

  if (contextPresent) {
    if (IsDev)
      console.info(`The offscreen context "${Keys.OffscreenURL}" already exists!`);
    return true;
  }

  if (!creatingDocument) {
    const options: chrome.offscreen.CreateParameters = {
      url: "offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Audio controller on shopping website or website of user's choice.",
    };
    creatingDocument = await chrome.offscreen.createDocument(options);
    creatingDocument = null;
  }

  return true;
}

async function auditTabUpdate(
  tabId: number,
  changeInfo: chrome.tabs.OnUpdatedInfo,
  tab: chrome.tabs.Tab
) {
  if (IsDev) {
    console.log("tabId: ");
    console.log(tabId);
    console.log("changeInfo: ");
    console.log(changeInfo);
  }

  if (tab?.status == "complete") {
    const tabs = await chrome.tabs.query(tabQueryOptions);
    await spawnDocument(tabs);
  }

  return true;
}

async function auditTabChange() {
  const tabs = await chrome.tabs.query(tabQueryOptions);
  await spawnDocument(tabs);
  return true;
}

chrome.tabs.onUpdated.addListener(auditTabUpdate);
chrome.tabs.onActivated.addListener(auditTabChange);
chrome.runtime.onStartup.addListener(auditTabChange);
chrome.runtime.onInstalled.addListener(auditTabChange);
// https://developer.chrome.com/docs/extensions/reference/api/tabs#event-onActivated