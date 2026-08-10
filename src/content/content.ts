import { Keys } from "../Constants.ts";

async function alertUser(
  message: string,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: { message: string, sender: chrome.runtime.MessageSender, tabId: string | undefined }) => void
) {
  if (message === Keys.Alert) {
    const tabId = sender.id;
    chrome.runtime.sendMessage(message);

    // debug
    const list = {message, sender, tabId};
    sendResponse(list);
  }
  return true;
}

chrome.runtime.onMessage.addListener(alertUser);