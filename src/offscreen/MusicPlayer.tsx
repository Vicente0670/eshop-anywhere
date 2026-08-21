import { useEffect, useRef, useState } from "react";
import { MusicURLBase, MusicURL, type Message, IsDev } from "../Constants.ts";
import { SettingQuery, Settings, verifySettings, type Setting } from "../Settings.ts";

export default function MusicPlayer() {
  const [loaded, isLoaded] = useState(false);
  const [index, setIndex] = useState(0);
  const [trackIncrement, setTrackIncrement] = useState<number>(0);
  const tag = useRef<HTMLAudioElement>(null);
  const url = useRef<string>(MusicURLBase + MusicURL[Settings.Track.Value as number].URL);
  const importedSettings = useRef<Setting>(Settings);

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

  function updateGrace(g: boolean) {
    const e = tag.current;
    if (!(e instanceof HTMLAudioElement)) return;
    if (g && (e.muted || e.volume === 0))
      e.pause();
    else 
      e.play();
  }

  function updateLoop(l: boolean) {
    const e = tag.current;
    if (!(e instanceof HTMLAudioElement)) return;
    e.loop = l;
  }

  function updateMute(m: boolean) {
    const e = tag.current;
    if (!(e instanceof HTMLAudioElement)) return;
    e.muted = m;
  }

  function updateTrack(i: number) {
    const e = tag.current;
    if (!(e instanceof HTMLAudioElement)) return;
    e.src = MusicURLBase + MusicURL[i].URL;
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
        (message.Event === "change" || message.Event === "input")
      ) {
        updateVolume(message.Value as number);
      }

      if (message.Event === "change") {

        if (message.Type === Settings.Muted.Key) {
          updateMute(message.Value as boolean);
        }
  
        if (message.Type === Settings.Loop.Key) {
          updateLoop(message.Value as boolean);
        }

        if (message.Type === Settings.Grace.Key) {
          updateGrace(message.Value as boolean);
        }
      }

      updateGrace(importedSettings.current.Grace.Value as boolean);

      if (IsDev) {
        console.log(sender);
        console.log(sendResponse);
      }
    }

    async function initialize() {
      const player = tag.current;
      const msg: Message = { Type: SettingQuery };
      const settings: Setting = verifySettings(await chrome.runtime.sendMessage(msg));
      importedSettings.current = settings;

      if (navigator.mediaSession && player instanceof HTMLAudioElement) {

        const volume = Number.parseInt(settings.Volume.Value as string) || Settings.Volume.Value as number;

        updateTrack(settings.Track.Value as number)
        updateGrace(settings.Grace.Value as boolean);

        if (!player.src)
          player.src = url.current;

        url.current = player.src;
        player.loop = settings.Loop.Value as boolean;
        player.muted = settings.Muted.Value as boolean;
        player.volume = volume / 100;
        player.load();

        setDocumentTitle();

        navigator.mediaSession.setActionHandler("play", mediaActions);
        navigator.mediaSession.setActionHandler("pause", mediaActions);
        navigator.mediaSession.setActionHandler("nexttrack", mediaActions);
        navigator.mediaSession.setActionHandler("previoustrack", mediaActions);
        isLoaded(true);
      }
      else {
        console.error(`Music failed to start.\nThe music player either is not recognized, or your browser doesn't support the navigator.mediaSession API... somehow.\nCheck compatibility on [https://caniuse.com/mdn-api_navigator_mediasession].`);
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