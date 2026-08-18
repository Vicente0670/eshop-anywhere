import { useEffect, useRef, useState } from "react";
import { compareArrays, MusicURLBase, MusicURL, type Message, IsDev } from "../Constants.ts";
import { SettingNames, Settings, type Setting } from "../Settings.ts";

export default function MusicPlayer() {
  const [loaded, isLoaded] = useState(false);
  const [index, setIndex] = useState(0);
  const [trackIncrement, setTrackIncrement] = useState<number>(0);
  const tag = useRef<HTMLAudioElement>(null);
  const url = useRef<string>(MusicURLBase + MusicURL[0].URL);

  const audioId = "app-audio-player";
  const containerId = "app-audio-container";

  function mediaActions(media: MediaSessionActionDetails) {
    const player = tag.current;
    if (!(player instanceof HTMLAudioElement)) return;

    if (media.action === "play") {
      player.play();
    }
    if (media.action === "pause") {
      player.pause();
    }
    if (media.action === "nexttrack") {
      setTrackIncrement(1);
    }
    if (media.action === "previoustrack") {
      setTrackIncrement(-1);
    }
    if (media.action === "seekbackward") {
      player.currentTime -= 10;
    }
    if (media.action === "seekforward") {
      player.currentTime += 10;
    }

    if (IsDev) {
      console.info(`MusicPlayer.tsx: mediaActions() - Action: "${media.action}"`);
    }
  }

  function updateMute(m: boolean) {
    const e = tag.current;
    if (!(e instanceof HTMLAudioElement)) return;
    e.muted = m;
  }

  function updateVolume(v: number) {
    const e = tag.current;
    if (!(e instanceof HTMLAudioElement)) return;
    e.volume = v / 100;
  }

  useEffect(() => {
    const player = tag.current;

    if (player instanceof HTMLAudioElement) {
      player.addEventListener("ended", nextSongEvent);
      chrome.runtime.onMessage.addListener(updateValues);
    }

    function setDocumentTitle() {
      document.title = MusicURL[index].Title;
    }

    function requestURL(increment: number): string {
      let newIndex = index + increment;
      if (newIndex >= MusicURL.length)
        newIndex = 0;
      if (newIndex < 0)
        newIndex = MusicURL.length - 1;

      setIndex(newIndex);
      document.title = MusicURL[newIndex].Title;
      return MusicURLBase + MusicURL[newIndex].URL;
    }
    
    function queryTrack(increment: number) {
      setTrackIncrement(0);
      const player = tag.current;
      if (player instanceof HTMLAudioElement) {
        url.current = requestURL(increment);
        player.src = url.current;
        player.load();
      }
    }

    function nextSongEvent(ev: Event) {
      const increment = 1;
      if (ev.target instanceof HTMLAudioElement && ev.type === "ended")
        queryTrack(increment);
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

    async function initialize() {
      const msg: Message = {
        Type: Settings.Query.Key,
        Value: 0
      }
      const settings: Setting = await chrome.runtime.sendMessage(msg);
      
      if (
        navigator.mediaSession &&
        tag.current instanceof HTMLAudioElement &&
        compareArrays(Object.keys(settings), SettingNames)
      ) {
        const volume = Number.parseInt(settings.Volume.Value as string) || Settings.Volume.Value as number;
        tag.current.src = url.current;
        tag.current.muted = settings.Muted.Value as boolean;
        tag.current.volume = volume / 100;
        tag.current.load();
        setDocumentTitle();

        navigator.mediaSession.setActionHandler("play", mediaActions);
        navigator.mediaSession.setActionHandler("pause", mediaActions);
        navigator.mediaSession.setActionHandler("nexttrack", mediaActions);
        navigator.mediaSession.setActionHandler("previoustrack", mediaActions);
        isLoaded(true);
      }
      else {
        console.error(`Music failed to start.\nContent may already be loaded, or function "compareArrays" likely failed to validate equivalency of settings and SettingNames's keys.`);
      }
    }

    if (!loaded && index == 0) {
      initialize();
    }

    if (trackIncrement !== 0) {
      queryTrack(trackIncrement);
    }

    return () => {
      if (player instanceof HTMLAudioElement) {
        player.removeEventListener("ended", nextSongEvent);
      }

      chrome.runtime.onMessage.removeListener(updateValues);
    }
  }, [loaded, index, trackIncrement]);

  return (
    <div id={containerId}>
      <audio id={audioId} autoPlay ref={tag} muted={false}></audio>
    </div>
  );
}