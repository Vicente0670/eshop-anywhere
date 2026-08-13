import { useEffect, useRef } from "react";
import { IsDev, MusicURLBase, MusicURL } from "../Constants.ts";

export default function MusicPlayer() {
  const container = useRef<HTMLElement>(null);
  const tag = useRef<HTMLAudioElement>(null);
  const url = useRef<string>(MusicURLBase + MusicURL[0].URL);

  const audioContainer = "app-audio-container";
  const audioTag = "app-audio-player";

  function initialize() {
    const parent = container.current = document.getElementById(audioContainer)!;
    
    if (parent.children.length < 1) {
      const child = tag.current = document.createElement("audio");

      child.src = url.current;
      child.autoplay = child.loop = true;
      child.volume = 1/3;
      child.muted = false;
      child.id = audioTag;
      child.load();

      document.title = MusicURL[0].Title;

      parent.appendChild(child);
    }
    else {
      if (!IsDev)
        console.warn("Too many audio contexts attempted to play, or there exists an unneeded child node of audioContainer.");
    }
  }

  useEffect(initialize);

  return (
    <div id={audioContainer} />
  );
}