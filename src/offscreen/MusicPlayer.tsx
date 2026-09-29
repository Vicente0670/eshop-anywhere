import { useCallback, useEffect, useRef, useState } from "react";
import { MusicURLBase, MusicURL, type Message, IsDev, MusicURLSystem, MusicTechnicalIds } from "../Constants.ts";
import { MediaCommands, SettingQuery, Settings, type MediaContent, type Setting } from "../Settings.ts";

export default function MusicPlayer() {
  const [loaded, isLoaded] = useState(false);
  const [technicalMusicType, setTechnicalMusicType] = useState<number>(-1);
  const [updatableMusic, setUpdatableMusic] = useState<boolean>(true);
  const technicalMusicPlaying = useRef<boolean>(false);
  const importedSettings = useRef<Setting>(Settings);
  const index = useRef<number>(0);
  const tag = useRef<HTMLAudioElement>(null);
  const url = useRef<string>(MusicURLBase + MusicURL[0].URL);

  const audioId = "app-audio-player";
  const containerId = "app-audio-container";




  // [ ### Non-dependencies ### ]

  function updateGrace(g: boolean) {
    const e = tag.current;
    if (!(e instanceof HTMLAudioElement)) return;
    if (g && (e.muted || e.volume === 0))
      e.pause();
    else if (e.paused && e.networkState !== HTMLMediaElement.NETWORK_NO_SOURCE) {
      e.play()
        .catch(err => "updateGrace(): An error occurred while attempting to play music.\n" + err + "\ne.networkState:" + e.networkState);
    }
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

  function updateVolume(v: number) {
    const e = tag.current;
    if (!(e instanceof HTMLAudioElement)) return;
    e.volume = v / 100;
  }

  function verifyIndex(n: number): number {
    if (n >= MusicURL.length)
      return 0;
    if (n < 0)
      return MusicURL.length - 1;
    return n;
  }

  // [ ######################## ]






  // [ ### Callbacks ### ]

  const updateAppMedia = useCallback(async () => {
    const e = tag.current;
    if (!e || !(e instanceof HTMLAudioElement)) return;

    let finalIndex: number;

    if (technicalMusicPlaying.current)
      finalIndex = technicalMusicType;
    else
      finalIndex = index.current;

    const msg: MediaContent = {
      Index: finalIndex,
      Paused: e.paused,
      Duration: e.duration,
      Timestamp: e.currentTime,
      Technical: technicalMusicPlaying.current
    };
    return await chrome.runtime.sendMessage(msg);
  }, [
    technicalMusicType
  ]);

  const updatePaused = useCallback(async (p: boolean) => {
    const e = tag.current;
    if (!(e instanceof HTMLAudioElement)) return;
    p ??= false;
    if (!p)
      e.play().catch(e => console.log("updatePaused(): Failed to play music.\n" + e));
    else
      e.pause();
    await updateAppMedia();
  }, [updateAppMedia]);

  const requestURL = useCallback((i: number): string => {
    i = verifyIndex(i);
    index.current = i;
    document.title = MusicURL[i].Title;
    return MusicURLBase + MusicURL[i].URL;
  }, [index]);

  const updateTrack = useCallback(async (i: number) => {
    const e = tag.current;
    if (!(e instanceof HTMLAudioElement)) return;
    e.src = requestURL(i);
    await updateAppMedia();
  }, [requestURL, updateAppMedia]);

  const mediaActions = useCallback(async (media: MediaSessionActionDetails) => {
    const player = tag.current;
    if (!(player instanceof HTMLAudioElement)) return;

    if (media.action === "play" && player.networkState !== HTMLMediaElement.NETWORK_LOADING) {
      const paused = false;
      await updatePaused(paused);
    }
    if (media.action === "pause") {
      const paused = true;
      await updatePaused(paused);
    }
    if (media.action === "nexttrack") {
      updateTrack(index.current + 1);
    }
    if (media.action === "previoustrack") {
      if (player.currentTime > 3)
        player.currentTime = 0;
      else
        updateTrack(index.current - 1);
    }
    if (media.action === "seekbackward") {
      player.currentTime -= 10;
    }
    if (media.action === "seekforward") {
      player.currentTime += 10;
    }

    if (IsDev)
      console.info(`MusicPlayer.tsx: mediaActions() - Action: "${media.action}"`);

  }, [
    updatePaused,
    updateTrack
  ]);

  // [ ################# ]






  // [ ### Use Effect ### ]

  useEffect(() => {
    const player = tag.current;

    if (player instanceof HTMLAudioElement) {
      player.addEventListener("ended", nextSongEvent);
      chrome.runtime.onMessage.addListener(messageParser);
    }

    function setDocumentTitle(id?: number) {
      if (id)
        document.title = MusicURL[id].Title;
      else
        document.title = MusicURL[index.current].Title;
    }
    
    async function queryTrack(i: number) {
      const player = tag.current;
      if (player instanceof HTMLAudioElement) {
        await updateTrack(i);
      }
    }

    // might refactor this to work in tandem w/ updateTrack ??
    async function setTechnicalMusic(i: number) {
      const player = tag.current;
      if (player instanceof HTMLAudioElement && i !== technicalMusicType) {
        technicalMusicPlaying.current = true;
        setTechnicalMusicType(i);
        const mus = MusicURLSystem[i];
        document.title = mus.Title;
        url.current = MusicURLBase + mus.URL;
        player.src = url.current;
        player.loop = true;
        player.load();
        await updateAppMedia();
      }
    }

    function nextSongEvent(ev: Event) {
      if (ev.target instanceof HTMLAudioElement && ev.type === "ended")
        queryTrack(index.current + 1);
    }

    async function mediaRequestHandler(message: Message): Promise<number> {
      let res: number;

      switch (message.Type) {

        case MediaCommands.Scrub: {
          const p = tag.current;
          const timestamp: number = message.Value as number;
          if (!p || timestamp == null)
            res = -1;
          else {
            p.pause();
            res = p.currentTime = timestamp;
          }
          break;
        }

        case MediaCommands.EndScrub: {
          const p = tag.current;
          const timestamp: number = message.Value as number;
          if (!p || timestamp == null)
            res = -1;
          else {
            res = p.currentTime = timestamp;
            const paused = false;
            updatePaused(paused);
          }
          break;
        }

        case MediaCommands.SetToBeginning: {
          const p = tag.current;
          if (!p)
            res = -1;
          else
            res = p.currentTime = 0;
          break;
        }

        case MediaCommands.Previous: {
          res = index.current - 1;
          updateTrack(res);
          break;
        }

        case MediaCommands.Previous10: {
          const p = tag.current;
          if (!p)
            res = -1;
          else
            res = (p.currentTime -= 10);
          break;
        }

        case MediaCommands.PlayPause: {
          const p = tag.current;
          if (!p)
            res = -1;
          else {
            updatePaused(!p.paused);
            res = p.paused ? 1 : 0;
          }
          break;
        }

        case MediaCommands.Next10: {
          const p = tag.current;
          if (!p)
            res = -1;
          else
            res = (p.currentTime += 10);
          break;
        }

        case MediaCommands.Next: {
          res = index.current + 1;
          updateTrack(res);
          break;
        }

        default:
          res = -1;
      }

      return res;
    }

    // refactor this WHOLE generation
    async function settingsHandler(message: Message) {
      if (
        message.Type === Settings.Volume.Key &&
        (message.Event === "change" || message.Event === "input")
      ) {
        updateVolume(message.Value as number);
      }

      else if (message.Event === "change") {

        if (message.Type === Settings.Muted.Key) {
          updateMute(message.Value as boolean);
        }

        else if (message.Type === Settings.Loop.Key) {
          updateLoop(message.Value as boolean);
        }

        else if (message.Type === Settings.Grace.Key) {
          updateGrace(message.Value as boolean);
        }

        else if (message.Type === Settings.Paused.Key) {
          updatePaused(message.Value as boolean);
        }

        else if (message.Type === Settings.Track.Key) {
          await updateTrack(message.Value as number ?? 0);
        }

        if (message.Type === Settings.Technical.Key && importedSettings.current.Technical.Value as boolean == true) {
          const value = message.Value as number;
          if (value >= 0) {
            setUpdatableMusic(true);
            if (value !== technicalMusicType)
              setTechnicalMusic(value ?? MusicTechnicalIds.Settings);
          }
          else if (updatableMusic) {
            technicalMusicPlaying.current = false;
            setTechnicalMusicType(value);
            setUpdatableMusic(false);
            await updateTrack(index.current);
          }
        }
      }
    }
    
    async function messageParser(
      message: Message,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: number) => void
    ) {

      const res = await mediaRequestHandler(message);
      settingsHandler(message);

      if (message.Type != MediaCommands.Scrub)
        updateAppMedia();


      if (IsDev) {
        console.log(sender);
        console.log(sendResponse);
      }

      if (res > -1)
        return sendResponse(res);
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
        track ??= index.current;
        await updateTrack(track);
        setDocumentTitle(track);
        updateGrace(settings.Grace.Value as boolean ?? true);

        if (!player.src)
          player.src = url.current;

        url.current = player.src;
        player.loop = loop;
        player.muted = muted;
        player.volume = volume / 100;
        player.load();

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
      return;
    }

    if (!loaded && index.current == 0) {
      initialize();
    }

    return () => {
      if (player instanceof HTMLAudioElement) {
        player.removeEventListener("ended", nextSongEvent);
      }

      chrome.runtime.onMessage.removeListener(messageParser);
    }
  }, [
    loaded,
    index,
    technicalMusicPlaying,
    technicalMusicType,
    updatableMusic,
    updateTrack,
    updateAppMedia,
    updatePaused,
    requestURL,
    mediaActions
  ]);

  // [ ################## ]

  return (
    <div id={containerId}>
      <audio
        autoPlay
        ref={tag}
        id={audioId}
        muted={false}
        onCanPlay={updateAppMedia}
      />
    </div>
  );
}