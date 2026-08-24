import { useEffect, useRef, useState } from "react";
import { MusicURLBase, MusicURL, type Message, IsDev, MusicURLSystem } from "../Constants.ts";
import { AppMediaQuery, SettingQuery, Settings, type Setting } from "../Settings.ts";

export default function MusicPlayer() {
  const [loaded, isLoaded] = useState(false);
  const [index, setIndex] = useState(0);
  const [trackIncrement, setTrackIncrement] = useState<number>(0);
  const [technicalMusicPlaying, setTechnicalMusicPlayState] = useState<boolean>(false);
  const tag = useRef<HTMLAudioElement>(null);
  const url = useRef<string>(MusicURLBase + MusicURL[0].URL);
  const importedSettings = useRef<Setting>(Settings);

  const audioId = "app-audio-player";
  const containerId = "app-audio-container";

  async function updateAppMedia() {
    const msg: Message = {
      Type: AppMediaQuery,
      Value: index ?? 0,
      Event: "change"
    };
    return await chrome.runtime.sendMessage(msg);
  }

  function mediaActions(media: MediaSessionActionDetails) {
    const player = tag.current;
    if (!(player instanceof HTMLAudioElement)) return;

    if (media.action === "play" && player.networkState !== HTMLMediaElement.NETWORK_LOADING) {
      player.play();
    }
    if (media.action === "pause") {
      player.pause();
    }
    if (media.action === "nexttrack") {
      setTrackIncrement(1);
    }
    if (media.action === "previoustrack") {
      if (player.currentTime > 3)
        player.currentTime = 0;
      else
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
    setTechnicalMusicPlayState(false);
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

    function setTechnicalMusic(index: number) {
      const player = tag.current;
      if (player instanceof HTMLAudioElement) {
        const mus = MusicURLSystem[index]
        document.title = mus.Title;
        url.current = MusicURLBase + mus.URL;
        player.src = url.current;
        player.loop = true;
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

        if (message.Type === Settings.Track.Key) {
          updateTrack(message.Value as number ?? 0);
        }

        console.log(importedSettings.current.Technical.Value as boolean);
        

        if (message.Type === Settings.Technical.Key && importedSettings.current.Technical.Value as boolean == true) {
          const value = message.Value as number;
          if (!technicalMusicPlaying && value > 0) {
            setTechnicalMusicPlayState(true);
            setTechnicalMusic(value ?? 0);
          }
          else {
            setTechnicalMusicPlayState(false);
          }
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
      const settings: Setting = await chrome.runtime.sendMessage(msg);
      importedSettings.current = settings;

      if (navigator.mediaSession && player instanceof HTMLAudioElement) {

        const volume = Number.parseInt(settings.Volume.Value as string) || Settings.Volume.Value as number;
        const loop = settings.Loop.Value as boolean;
        const muted = settings.Muted.Value as boolean

        let track;
        if (typeof settings.Track.Value === "number")
          track = settings.Track.Value as number;
          
        updateTrack(track ?? 0);
        updateGrace(settings.Grace.Value as boolean);

        if (!player.src)
          player.src = url.current;

        url.current = player.src;
        player.loop = loop;
        player.muted = muted;
        player.volume = volume / 100;
        player.load();

        setDocumentTitle();

        const msg: Message = { Type: Settings.Technical.Key };
        await chrome.runtime.sendMessage(msg);

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
  }, [loaded, index, technicalMusicPlaying, trackIncrement]);

  return (
    <div id={containerId}>
      <audio id={audioId} autoPlay ref={tag} muted={false}></audio>
    </div>
  );
}