import { Keys } from "../Constants.ts";

let documentCreating: void | null;
async function spawnOffscreenDocument(
  message: string,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: {message: string, sender: chrome.runtime.MessageSender}) => void
) {
  if (message == Keys.Alert) {  

    // Only one context will ever be needed of Keys.OffscreenURL
    const contextOptions: chrome.runtime.ContextFilter = {
      contextTypes: ["OFFSCREEN_DOCUMENT"]
    };
    const currentScreens = await chrome.runtime.getContexts(contextOptions);

    if (currentScreens.length > 0) {
      console.warn(`The offscreen context "${Keys.OffscreenURL}" already exists!`);
      return;
    }

    if (!documentCreating) {
      const options: chrome.offscreen.CreateParameters = {
        url: "offscreen.html",
        reasons: ["AUDIO_PLAYBACK"],
        justification: "Audio controller on shopping website or website of user's choice.",
      };
      documentCreating = await chrome.offscreen.createDocument(options);
      documentCreating = null;
    }

    const list = {message, sender};
    sendResponse(list);
  }
  return true;
}

chrome.runtime.onMessage.addListener(spawnOffscreenDocument);
// https://developer.chrome.com/docs/extensions/reference/api/tabs#event-onActivated