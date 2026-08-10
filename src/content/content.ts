import { Keys } from "../Constants.ts";

function alertUser(
  message: string,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: { message: string, sender: chrome.runtime.MessageSender, tabId: string | undefined }) => void
) {
  console.log("received a message! what could it be... " + sender?.url);
  if (message === Keys.Alert) {
    console.log("Message:\n" + message);
    console.log("Sender:")
    console.log(sender);
    console.log("Status:\n" + true);
    const tabId = sender.id;
    const list = {message, sender, tabId};
    console.log(list);
    
    sendResponse(list);
  }
  return true;
}

chrome.runtime.onMessage.addListener(alertUser);