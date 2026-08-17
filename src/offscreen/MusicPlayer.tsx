import { useEffect, useRef } from "react";
import { compareArrays, MusicURLBase, MusicURL, type Message, IsDev } from "../Constants.ts";
import { SettingNames, Settings, type Setting } from "../Settings.ts";

export default function MusicPlayer() {
  const tag = useRef<HTMLAudioElement>(null);
  const url = useRef<string>(MusicURLBase + MusicURL[0].URL);

  const audioId = "app-audio-player";
  const containerId = "app-audio-container";

  function updateVolume(v: number) {
    const e = tag.current!;
    e.volume = v / 100;
  }

  function updateMute(m: boolean) {
    const e = tag.current!;
    e.muted = m;
  }

  async function updateValues(
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: number) => void
  ) {
    if (
      message.Type === Settings.Volume.Key &&
      typeof message.Value === "number" &&
      message.EventCaller === "set"
    ) {
      updateVolume(message.Value)
    }
    if (
      message.Type === Settings.Volume.Key &&
      typeof message.Value === "number" &&
      (message.EventCaller === "change" || message.EventCaller === "input")
    ) {
      updateVolume(message.Value);
    }

    if (
      message.Type === Settings.Muted.Key &&
      typeof message.Value === "boolean" &&
      message.EventCaller === "change"
    ) {
      updateMute(message.Value);
    }
    if (IsDev) {
      console.log(sender);
      console.log(sendResponse);
    }
  }

  useEffect(() => {
    async function initialize() {
      const player = tag.current;
      const msg: Message = {
        Type: Settings.Query.Key,
        Value: 0
      }
      const settings: Setting = await chrome.runtime.sendMessage(msg);

      if (
        player instanceof HTMLAudioElement &&
        compareArrays(Object.keys(settings), SettingNames)
      ) {

        const volume = Number.parseInt(settings.Volume.Value as string) || Settings.Volume.Value as number;
        player.autoplay = true;
        player.loop = true;
        player.src = url.current;
        player.muted = settings.Muted.Value as boolean || false;
        player.volume = volume / 100;
        player.load();

      }
      else {
        console.error(`Music failed to start.\nFunction "compareArrays" likely failed to validate equivalency of settings and SettingNames's keys.`);
      }
    }
    initialize();

    chrome.runtime.onMessage.addListener(updateValues);
  });

  return (
    <div id={containerId}>
      <audio id={audioId} ref={tag}></audio>
    </div>
  );
}