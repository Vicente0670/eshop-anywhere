import { Keys } from "../Constants.ts";

let documentCreating = false;
async function spawnOffscreenDocument(
  message: string,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: {message: string, sender: chrome.runtime.MessageSender}) => void
) {
  if (message == Keys.Alert) {

    const contextOptions: chrome.runtime.ContextFilter = {
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [Keys.OffscreenURL]
    }
    const currentScreens = await chrome.runtime.getContexts(contextOptions);
    if (currentScreens.length > 0) return;

    if (!documentCreating) {
      documentCreating = true;
      const options: chrome.offscreen.CreateParameters = {
        url: "offscreen.html",
        reasons: ["AUDIO_PLAYBACK"],
        justification: "Audio controller on the website of choice.",
      };
      chrome.offscreen.createDocument(options);
      documentCreating = false;
    }
    


    const list = {message, sender};
    sendResponse(list);
  }
  return true;
}

chrome.runtime.onMessage.addListener(spawnOffscreenDocument);
// https://developer.chrome.com/docs/extensions/reference/api/tabs#event-onActivated