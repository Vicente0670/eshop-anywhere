import { IsDev, Keys, Websites, type Message } from "../Constants.ts";
import { SettingQuery, Settings, verifySettings, type Setting } from "../Settings.ts";

const tabQueryOptions: chrome.tabs.QueryInfo = {
  windowType: "normal",
  status: "complete",
  url: Websites
}

function delimiter(str: string): string {
  return str + "() - ";
}

let creatingDocument: null | void;
async function spawnDocument(tabs: chrome.tabs.Tab[]) {
  const functionName = delimiter(spawnDocument.name);
  // Only one context will ever be needed of Keys.OffscreenURL
  const contextOptions: chrome.runtime.ContextFilter = {
    contextTypes: ["OFFSCREEN_DOCUMENT"]
  };
  const contextPresent = (await chrome.runtime.getContexts(contextOptions)).length > 0;

  if (!tabs || tabs.length == 0) {
    if (contextPresent) {

      if (IsDev)
        console.info(`${functionName}No tabs exist that fit the criteria of Websites, so the offscreen document has closed.`);

      return await chrome.offscreen.closeDocument();
    }
    return true;
  }

  if (contextPresent) {
    if (IsDev)
      console.info(`${functionName}The offscreen context "${Keys.OffscreenURL}" already exists!`);
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

    if (IsDev && (await chrome.runtime.getContexts(contextOptions)).length > 0) {
      console.warn(`${functionName}The offscreen document has been created.`);
    }
  }

  return true;
}

async function auditTabUpdate(
  tabId: number,
  changeInfo: chrome.tabs.OnUpdatedInfo,
  tab: chrome.tabs.Tab
) {
  const functionName = delimiter(auditTabUpdate.name);
  if (IsDev) {
    console.log(`${functionName}tabId: ${tabId}`);
    console.log(`${functionName}changeInfo: ${changeInfo}`);
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

  const settings = await chrome.storage.sync.get(null);
  if (Object.keys(settings).length === 0)
    await chrome.storage.sync.set(Settings);

  return true;
}

async function querySettings(
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: Setting) => void
) {
  const functionName = delimiter(querySettings.name);

  if (IsDev) {
    console.group();
    console.info(`${functionName}Settings have been queried.`);
    console.info(sender);
    console.groupEnd();
  }

  if (message.Type === SettingQuery) {

    if (message.Value) {
      return await chrome.storage.sync.set(message.Value as Setting);
    }

    let storage: Setting = await chrome.storage.sync.get(null);

    if (!storage) {
      sendResponse(Settings);
      return true;
    }

    storage = verifySettings(storage);

    sendResponse(storage);
    return true;
  }

  return true;
}

chrome.tabs.onUpdated.addListener(auditTabUpdate);
chrome.tabs.onActivated.addListener(auditTabChange);
chrome.runtime.onStartup.addListener(auditTabChange);
chrome.runtime.onInstalled.addListener(auditTabChange);

chrome.runtime.onMessage.addListener(querySettings);