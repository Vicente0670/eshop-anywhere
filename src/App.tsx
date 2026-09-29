import "./App.css";
import { useEffect, useRef } from "react";
import { AppSettingsPort, Brand, IsDev, LogoMinAppearanceHeight, MusicURL, MusicURLSystem, type Message, type MusicContainer } from "./Constants.ts";
import { Settings, type SettingsLayout, type Setting, SettingQuery, verifySettings, SettingDescriptions, type SettingIds, SettingNumberData, type SettingKeys, ServiceCommands, type MediaContent, MediaCommands } from "./Settings.ts";
import Tooltip from "./components/Tooltip.tsx";
import { formatMMSSMM } from "./Time.ts";

export default function App() {
  const service = useRef<chrome.runtime.Port>(null);
  const settingsRefs = useRef<HTMLLabelElement[]>([]);
  const currentSettings = useRef<Setting>(Settings);
  const newSettings = useRef<Setting>(Object());
  const logo = useRef<HTMLElement>(null);
  const media = useRef<HTMLFieldSetElement>(null);
  const musicPlayerScrubber = useRef<HTMLInputElement>(null);
  
  const musicTitle = useRef<HTMLHeadingElement>(null);
  const musicAlbum = useRef<HTMLParagraphElement>(null);
  const musicTimestamp = useRef<HTMLSpanElement>(null);
  const musicDuration = useRef<HTMLSpanElement>(null);

  const numericTimestamp = useRef<number>(0);
  const numericDuration = useRef<number>(0);
  const callBackId = useRef<number>(0);
  const isMusicPaused = useRef<boolean>(false);


  const settingsEntries = Object.entries(Settings);

  function musicTitleScroll() {
    const target = musicTitle.current!;
    const marginLeft = Number(getComputedStyle(target).marginLeft.replace("px", ""));
    
    const targetWidth = target.getBoundingClientRect().width + marginLeft * 2;
    const windowWidth = document.body.getBoundingClientRect().width / 2; 
    
    if (targetWidth >= windowWidth)
      target.classList.add("wide");
    else
      target.classList.remove("wide");
  }

  function footerLogoPrompt(ev: React.UIEvent) {
    const target = ev.nativeEvent.target as HTMLElement;
    const offset = target.scrollTop;
    const output = logo.current;

    if (!target || !output) return;

    if (offset >= LogoMinAppearanceHeight)
      output.classList.add("open");
    else
      output.classList.remove("open");
  }

  function updateTime(timestamp: number) {
    const start = performance.now();

    if (
      !musicTimestamp.current ||
      !musicDuration.current ||
      !musicPlayerScrubber.current ||
      numericDuration.current == null
    )
      return;
    
    if (timestamp > numericDuration.current || timestamp < 0)
      return requestAnimationFrame(() => updateTime(0));

    if (isMusicPaused.current) {
      updateUiTimestamp();
      return;
    }

    const timeElapsed: string = formatMMSSMM(timestamp);
    musicTimestamp.current.textContent = timeElapsed;
    numericTimestamp.current = timestamp;
    musicPlayerScrubber.current.valueAsNumber = timestamp;

    callBackId.current = requestAnimationFrame(() => updateTime(timestamp + ((performance.now() - start) / 1000)));
  }

  function updatePaused(p?: boolean) {
    if (p)
      isMusicPaused.current = true;
    else
      isMusicPaused.current = false;
  }

  async function updateMedia(
    msg: MediaContent,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: boolean) => void
  ) {
    const name = musicTitle.current;
    const album = musicAlbum.current;
    const time = musicTimestamp.current;
    const dur = musicDuration.current;
    const scrubber = musicPlayerScrubber.current;

    if (!name || !album || !time || !dur || !scrubber) return;

    let content: MusicContainer;

    if (msg.Technical)  
      content = MusicURLSystem[msg.Index];
    else
      content = MusicURL[msg.Index];

    const albums: string = content.Console.toString();
    const timestamp: number = msg.Timestamp;
    const duration: number = msg.Duration;

    const timeElapsed: string = formatMMSSMM(timestamp);
    const totalTime: string = formatMMSSMM(duration);

    name.textContent  = content.Title;
    album.textContent = albums;
    time.textContent  = timeElapsed;
    dur.textContent   = totalTime;
    scrubber.max      = duration.toString();
    
    numericDuration.current = duration;
    
    scrubber.valueAsNumber = timestamp;

    updatePaused(msg.Paused);
    updateTime(timestamp);
    musicTitleScroll();

    if (IsDev) {
      console.group(updateMedia.name);
      console.log(msg, sender, sendResponse);
      console.groupEnd();
    }
  }

  async function requestMediaChange(change: string) {
    const msg: Message = { Type: change };

    if (musicPlayerScrubber.current != null) {

      if (change === MediaCommands.Scrub)
        msg.Value = musicPlayerScrubber.current.valueAsNumber;

      else if (change === MediaCommands.EndScrub)
        msg.Value = musicPlayerScrubber.current.valueAsNumber;
    }

    if (IsDev) {
      console.groupCollapsed(requestMediaChange.name + "() - Requested Data");
      console.info(msg);
      console.groupEnd();
    }

    const response = await chrome.runtime.sendMessage(msg)
      .catch(e => console.error(requestMediaChange.name + "() - Media could not be requested: " + e));

    return response;
  }

  async function previousSong() {
    if (numericTimestamp.current > 3)
      return await requestMediaChange(MediaCommands.SetToBeginning);
    cancelAnimationFrame(callBackId.current);
    return await requestMediaChange(MediaCommands.Previous);
  }
  async function previousTenSeconds() { await requestMediaChange(MediaCommands.Previous10); }
  async function playPauseToggle() { await requestMediaChange(MediaCommands.PlayPause); } // perhaps toggle play/pause for timer locally too?
  async function nextTenSeconds() { await requestMediaChange(MediaCommands.Next10); }
  async function nextSong() {
    cancelAnimationFrame(callBackId.current);
    await requestMediaChange(MediaCommands.Next); 
  }
  async function beginScrub(ev: React.MouseEvent) {
    if (ev.button !== 0) return; // only reacts to left-click
    isMusicPaused.current = true;
    await requestMediaChange(MediaCommands.Scrub);
  }
  async function whileScrubbing(ev: React.MouseEvent) {
    if (ev.button !== 0) return;
    updateUiTimestamp();
  }
  async function endScrub() {
    isMusicPaused.current = false;
    await requestMediaChange(MediaCommands.EndScrub);
  }
  async function requestGeneralUpdate() {
    await requestMediaChange(MediaCommands.GeneralUpdate);
  }

  async function updateUiTimestamp() {
    const m = musicPlayerScrubber.current;
    const t = musicTimestamp.current;
    if (!m || !t) return;
    t.textContent = formatMMSSMM(m.valueAsNumber);
  }

  function serviceReceiveStatus(msg: string) {
    console.log(msg);
  }

  function hasEditedSettings(): boolean {
    return Object.entries(newSettings.current).length > 0;
  }

  function getNewSettings(): Setting | null {

    if (hasEditedSettings()) {
      const entries = Object.entries(newSettings.current);

      entries.forEach(([Name, Prop]) => {
        const settingName = Name as keyof Setting;
        currentSettings.current[settingName].Value = Prop.Value;
      });

      if (IsDev) {
        console.log();
        console.log(Object.assign.call({}, entries));
      }
      return currentSettings.current;
    }
    return null;
  }

  async function serviceSettingsReport() {
    const batch = getNewSettings();
    if (!batch) return;

    const msg: Message = {
      Type: ServiceCommands.Report,
      Value: batch
    }
    service.current?.postMessage(msg);
  }

  async function popupClose(p: chrome.runtime.Port) {
    
    if (hasEditedSettings()) {
      const data: Message = {
        Type: SettingQuery,
        Value: getNewSettings() as Setting,
      }
      await chrome.runtime.sendMessage(data);
    }

    console.log(`${popupClose.name}() - Port ${p.name} successfully closed.`);
  }

  async function inputUpdate(ev: Event) {
    const target = ev.target as HTMLInputElement;
    const parent = target.parentElement as HTMLLabelElement;
    const output = parent.querySelector(`#${target.name}`) as HTMLElement;
    let value: boolean | number | string;

    if (target.type === "range") {
      value = Number.parseInt(target.value) || 0;
      output.textContent = `${value}%`;
    }
    else if (Object.hasOwn(SettingNumberData, parent.htmlFor)) {
      const select = ev.target as HTMLSelectElement;
      value = select.selectedIndex;
    }
    else {
      value = target.checked;
      output.textContent = value ? "ON" : "OFF";
    }

    const setting = Object.values(Settings).find(e => e.Key === target.id);
    if (!setting)
      return;

    const settingName = target.name as keyof Setting;
    setting.Value = value;
    newSettings.current[settingName] = setting;

    const msg: Message = {
      Type: newSettings.current[settingName].Key,
      Value: value,
      Event: ev.type,
    }
    await serviceSettingsReport();
    await chrome.runtime.sendMessage(msg);
  }

  async function applyUserSettings() {
    if (Object.keys(newSettings.current).length !== 0) return;
    const settings: Setting = verifySettings(await chrome.storage.sync.get(null));
    currentSettings.current = settings;

    settingsRefs.current.forEach((element: HTMLLabelElement) => {

      let input: HTMLInputElement | HTMLSelectElement =
        element.querySelector(`#${element.htmlFor}`) as HTMLInputElement;
      const output = element.querySelector(`#${input.name}`) as HTMLElement;
      const settingName = input.name as keyof Setting;
      const value = settings[settingName].Value;

      if (settings[settingName].Type === "number")
        input = element.querySelector(`#${element.htmlFor}`) as HTMLSelectElement;

      if (input.type === "range") {
        input.value = value as string ?? "1";
        return output.textContent = `${value}%`;
      }
      if (input.type === "checkbox") {
        input.checked = value as boolean;
        return output.textContent = value ? "ON" : "OFF";
      }
      if (input instanceof HTMLSelectElement) {
        return input.selectedIndex = value as number;
      }

    });

  }

  function auditSettingsRef(element: HTMLLabelElement) {
    if (settingsRefs.current.length < settingsEntries.length) {

      const inputElem = element.querySelector(`#${element.htmlFor}`) as HTMLInputElement;

      if (inputElem.type === "range") {
        inputElem.addEventListener("change", inputUpdate);
        inputElem.addEventListener("input", inputUpdate);
      }
      else {
        inputElem.addEventListener("change", inputUpdate);
      }

      settingsRefs.current.push(element);
    }
  }

  function injectSelections(
    obj: object,
    index: number,
    key: SettingKeys
  ): React.JSX.Element {

    // Move this into a new function if implementing multiple selections
    if (key === Settings.Track.Key) {
      const element = obj as MusicContainer;
      return <option key={element.Title} value={index}>{`[${index}] ${element.Title}`}</option>;
    }

    return <></>;
  }

  function injectSettings(
    [Name, Prop]: [
      string,
      SettingsLayout
    ]
  ): React.JSX.Element {

    const dataObj = SettingDescriptions[Name as SettingIds];

    if (Prop.Type === "range") {
      return (
        <article className="setting" key={Name}>
          <p className="name">{Prop.Name}</p>
          <Tooltip Id={dataObj.Id} Description={dataObj.Description} />
          <label className="label" htmlFor={Prop.Key} ref={auditSettingsRef}>
            <output className="status" id={Name}>?%</output>
            <input
              className={`slider`}
              id={Prop.Key}
              type={Prop.Type}
              min={0}
              max={100}
              step={1}
              list="presets"
              name={Name}
            />
          </label>
          <datalist id="presets">
            <option value="25"></option>
            <option value="50"></option>
            <option value="75"></option>
          </datalist>
        </article>
      )
    }
    else if (Prop.Type === "number") {

      if (!SettingNumberData[Prop.Key]) return <></>;

      return (
        <article className="setting" key={Name}>
          <p className="name">{Prop.Name}</p>
          <Tooltip Id={dataObj.Id} Description={dataObj.Description} />
          <label className="label" htmlFor={Prop.Key} ref={auditSettingsRef}>
            <p className="status" id={Name} />
            <select className={`select`} id={Prop.Key} onChange={requestGeneralUpdate} name={Name}>
              {
                Object.values(SettingNumberData[Prop.Key as SettingKeys] as Array<object>).map(
                  (value, index) => injectSelections(value, index, Prop.Key)
                )
              }
            </select>
          </label>
        </article>
      )
    }
    else {
      return (
        <article className="setting" key={Name}>
          <p className="name">{Prop.Name}</p>
          <Tooltip Id={dataObj.Id} Description={dataObj.Description} />
          <label className="label" htmlFor={Prop.Key} ref={auditSettingsRef}>
            <p className="status" id={Name}>OFF</p>
            <input className={`${Prop.Type}`} id={Prop.Key} name={Name} type={Prop.Type} />
          </label>
        </article>
      )
    }
  }

  useEffect(() => {
    applyUserSettings();
    musicTitleScroll();
    window.addEventListener("resize", musicTitleScroll);
    chrome.runtime.onMessage.addListener(updateMedia);
    
    service.current = chrome.runtime.connect({ name: AppSettingsPort });
    service.current.onMessage.addListener(serviceReceiveStatus);
    service.current.onDisconnect.addListener(popupClose);
    
    chrome.runtime.sendMessage({ Type: null });

    return () => {
      window.addEventListener("resize", musicTitleScroll);
      chrome.runtime.onMessage.removeListener(updateMedia);
      service.current?.onMessage.removeListener(serviceReceiveStatus);
      service.current?.disconnect();
    }
  });

  return (
    <main className="app-main" onScroll={footerLogoPrompt}>

      <header className="app-title">
        <h1>eShop Anywhere</h1>
        <img className="icon" src={Brand.Shop.Icon} alt={Brand.Shop.Alt} draggable={false} />
      </header>

      <form className="app-settings">
        <fieldset className="media" ref={media}>
          <div className="metadata">
            <div className="title">
              <div className="scroller">
                <h3 ref={musicTitle} className="name">Nothing playing...</h3>
              </div>
            </div>
            <div className="data">
              <p className="album" ref={musicAlbum}>No album</p>
              <label
                htmlFor="music-progress"
                className="progress-label"
              >
                <span id="music-progress-current-time" ref={musicTimestamp}>00:00.000</span>/
                <span id="music-progress-full-time" ref={musicDuration}>00:00.000</span>
              </label>
            </div>
          </div>
          <div className="controls">
            <div className="media-container">
              <button type="button" className="btn-prev" onClick={previousSong} aria-label="Previous track" />
              <button type="button" className="btn-prev-10" onClick={previousTenSeconds} aria-label="Go back 10 seconds" />
              <button type="button" className="btn-control" onClick={playPauseToggle} aria-label="Play/Pause" />
              <button type="button" className="btn-next-10" onClick={nextTenSeconds} aria-label="Skip 10 seconds" />
              <button type="button" className="btn-next" onClick={nextSong} aria-label="Next track" />
            </div>
            <div className="progress-container">
              <input
                type="range"
                className="progress"
                name="music-progress"
                min={0}
                max={numericDuration.current ?? 100}
                step={1 / 500}
                ref={musicPlayerScrubber}
                onMouseDown={beginScrub}
                onMouseMove={whileScrubbing}
                onMouseUp={endScrub}
              />
            </div>
          </div>
        </fieldset>
        <fieldset className="scrollable">
          <header className="legend">
            <p>Settings</p>
          </header>
          {
            settingsEntries.map(injectSettings)
          }
        </fieldset>
      </form>

      <footer className="app-footer">
        <section className="title" ref={logo}>
          <p className="name">eShop Anywhere</p>
          <div className="curve-div" />
        </section>
        <section className="socials">
          {
            Object.entries(Brand)
              .filter(brand => brand[1].CanVisit !== false)
              .map(([Platform, Brand]) => (
                <a href={Brand.Link} title={Brand.Link} key={Platform}>
                  <img src={Brand.Icon} alt={Brand.Alt ?? Platform} />
                </a>
              )
              )
          }
          <div className="curve-div" />
        </section>
      </footer>

      <svg id="app-tooltip-speech-graphic" height={0} width={0} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id="app-tooltip-speech-path" maskContentUnits="objectBoundingBox">
            <path d="M 0 0.5 L 0.1 0.6 V 0.8 q 0 0.2 0.2 0.2 H 0.8 Q 1 1 1 0.8 V 0.2 Q 1 0 0.8 0 H 0.3 Q 0.1 0 0.1 0.2 V 0.4 Z" fill="#fff" />
          </mask>
        </defs>
      </svg>
      <svg id="app-footer-curve-graphic" height={0} width={0} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id="app-footer-curve-path" maskContentUnits="objectBoundingBox">
            <path d="M 0 0 L 0 1 L 1 1 C 0.5 1 0.5 0 0 0 Z" fill="#fff" />
          </mask>
        </defs>
      </svg>
    </main>
  );
}