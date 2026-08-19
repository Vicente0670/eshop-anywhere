import "./App.css";
import { useEffect, useRef } from "react";
import { Brand, IsDev, type Message } from "./Constants.ts";
import { Settings, type SettingsLayout, type Setting, SettingQuery, verifySettings } from "./Settings.ts";

export default function App() {
  const settingsRefs = useRef<HTMLLabelElement[]>([]);
  const currentSettings = useRef<Setting>(Settings);
  const newSettings = useRef<Setting>(Object());
  const settingsEntries = Object.entries(Settings);

  async function inputUpdate(ev: Event) {
    const target = ev.target as HTMLInputElement;
    const parent = target.parentElement as HTMLLabelElement;
    const output = parent.querySelector(`#${target.name}`) as HTMLElement;
    let value: boolean | number | string;

    if (target.type === "range") {
      value = Number.parseInt(target.value) || 0;
      output.textContent = `${value}%`;
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
    await chrome.runtime.sendMessage(msg);
  }

  async function applyUserSettings() {
    const settings: Setting = verifySettings(await chrome.storage.sync.get(null));
    currentSettings.current = settings;

    if (Object.keys(newSettings.current).length !== 0)
      return;

    settingsRefs.current.forEach((element: HTMLLabelElement) => {

      const input = element.querySelector(`input#${element.htmlFor}`) as HTMLInputElement;
      const output = element.querySelector(`#${input.name}`) as HTMLElement;
      const settingName = input.name as keyof Setting;
      const value = settings[settingName].Value;

      if ((value === undefined || value === null) && currentSettings.current[settingName])
        return delete currentSettings.current[settingName];

      if (input.type === "range") {
        input.value = value.toString() ?? "0";
        output.textContent = `${value}%`;
      }
      if (input.type === "checkbox") {
        input.checked = value as boolean;
        output.textContent = value ? "ON" : "OFF";
      }

    });

  }

  function auditSettingsRef(element: HTMLLabelElement) {

    if (settingsRefs.current.length < settingsEntries.length) {

      const inputElem = element.querySelector(`input#${element.htmlFor}`) as HTMLInputElement;

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

  function injectSettings(
    [Name, Prop]: [
      string,
      SettingsLayout
    ]
  ): React.JSX.Element {

    if (Prop.Type === "range") {
      return (
        <div className="setting" key={Name}>
          <p className="name">{Prop.Name}</p>
          <label className="label" htmlFor={Prop.Key} ref={auditSettingsRef}>
            <output className="status" id={Name}>50%</output>
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
        </div>
      )
    }
    else {
      return (
        <div className="setting" key={Name}>
          <p className="name">{Prop.Name}</p>
          <label className="label" htmlFor={Prop.Key} ref={auditSettingsRef}>
            <p className="status" id={Name}>OFF</p>
            <input className={`${Prop.Type}`} id={Prop.Key} name={Name} type="checkbox" />
          </label>
        </div>
      )
    }
  }

  useEffect(() => {
    applyUserSettings();

    function popupClose(ev: Event) {
      const entries = Object.entries(newSettings.current);

      if (entries.length) {

        entries.forEach(([Name, Prop]) => {
          const settingName = Name as keyof Setting;
          currentSettings.current[settingName].Value = Prop.Value;
        });

        const data: Message = {
          Type: SettingQuery,
          Value: currentSettings.current,
        }
        if (document.visibilityState === "hidden")
          chrome.runtime.sendMessage(data);
      }
      if (IsDev) {
        console.group();
        console.info("Visibility of App.tsx has been mutated. Event message is displayed below.");
        console.info(ev);
        console.groupEnd();
      }
    }

    document.addEventListener("visibilitychange", popupClose);

    return () => {
      document.removeEventListener("visibilitychange", popupClose);
    }
  });

  return (
    <>

      <main className="app-main">

        <div className="app-title">
          <h1>eShop Anywhere</h1>
          <img className="icon" src={Brand.Shop.Icon} alt={Brand.Shop.Alt} draggable={false} />
        </div>

        <form className="app-settings">
          <fieldset className="scrollable">
            <legend className="legend">
              <p>Settings</p>
            </legend>
            {
              settingsEntries.map(injectSettings)
            }
          </fieldset>
        </form>

        <footer className="app-footer">
          <section className="title">
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

      </main>

      <svg id="app-footer-curve-graphic" height={0} width={0} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id="app-footer-curve-path" maskContentUnits="objectBoundingBox">
            <path d="M 0 0 L 0 1 L 1 1 C 0.5 1 0.5 0 0 0 Z" fill="#fff" />
          </mask>
        </defs>
      </svg>

    </>
  );
}