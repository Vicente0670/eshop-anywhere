import { Keys } from "../Constants.ts";

const tabQueryOptions: chrome.tabs.QueryInfo = {
  windowType: "normal",
  status: "complete",
  url: [
    "https://*.amazon.com/*"
  ]
}

let creatingDocument: null | void;

async function spawnDocument(tabs: chrome.tabs.Tab[]) {
  if (!tabs || tabs.length == 0) return;

  // Only one context will ever be needed of Keys.OffscreenURL
  const contextOptions: chrome.runtime.ContextFilter = {
    contextTypes: ["OFFSCREEN_DOCUMENT"]
  };
  const currentContexts = await chrome.runtime.getContexts(contextOptions);

  if (currentContexts.length > 0) {
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
  _tabId: number,
  _changeInfo: chrome.tabs.OnUpdatedInfo,
  tab: chrome.tabs.Tab
) {
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