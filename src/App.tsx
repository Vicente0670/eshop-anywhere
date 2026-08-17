import "./App.css";
import { useEffect, useRef } from "react";
import { Brand, type Message } from "./Constants.ts";
import { Settings, type SettingsLayout, type Setting, returnSettingType } from "./Settings.ts";

export default function App() {
  const settingsRefs = useRef<HTMLLabelElement[]>([]);
  const settingsEntries = Object.entries(Settings).filter((Prop) => !Prop[1].IsQuery);

  async function inputUpdate(ev: Event) {
    const target = ev.target as HTMLInputElement;
    const output = target.parentElement!.querySelector(`#${target.id}`)!;
    let value: boolean | number | string;

    if (target.type === "range") {
      value = Number.parseInt(target.value) || 0;
      output.textContent = `${value}%`;
    }
    else {
      value = target.checked;
      output.textContent = value ? "ON" : "OFF";
    }
    
    const msg: Message = {
      Type: target.id,
      Value: value,
      EventCaller: ev.type
    }

    await chrome.runtime.sendMessage(msg);
  }

  async function applyUserSettings() {
    const settings: Setting = await chrome.storage.sync.get(null);

    settingsRefs.current.forEach(async (element: HTMLLabelElement) => {
      const inputElem = element.querySelector(`input#${element.htmlFor}`);
      const isInputElement = inputElem instanceof HTMLInputElement;

      if (isInputElement && settings) {

        if (
          inputElem.type === "range" &&
          inputElem.id == Settings.Volume.Key &&
          settings.Volume.Value !== undefined
        ) {
          const value = settings.Volume.Value.toString();
          inputElem.value = value;
          
          const outputElem = element.querySelector(`output#${element.htmlFor}`);
          if (outputElem instanceof HTMLOutputElement)
            outputElem.textContent = `${value}%`;
        }

        if (inputElem.type === "checkbox") {
          const value = returnSettingType(inputElem.id, settings);
          inputElem.checked = value;

          const outputElem = element.querySelector(`p#${element.htmlFor}`);
          if (outputElem instanceof HTMLParagraphElement)
            outputElem.textContent = value ? "ON" : "OFF";
        }

      }

    });
    
  }

  function auditSettingsRef(element: HTMLLabelElement) {

    if (settingsRefs.current.length < settingsEntries.length) {

      const inputElem = element.querySelector(`input#${element.htmlFor}`);
      const isInputElement = inputElem instanceof HTMLInputElement;

      if (isInputElement) {

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
  }

  function injectSettings(
    [Name, Prop]: [
      keyof Setting,
      SettingsLayout
    ]
  ): React.JSX.Element {

    if (Prop.Type === "range") {
      return (
        <div className="setting" key={Name}>
          <p className="name">{Prop.Name}</p>
          <label className="label" htmlFor={Prop.Key} ref={auditSettingsRef}>
            <output className="status" id={Prop.Key}>50%</output>
            <input
              className="slider"
              id={Prop.Key}
              type={Prop.Type}
              min={0}
              max={100}
              step={1}
              list="presets"
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
            <p className="status" id={Prop.Key}>OFF</p>
            <input className={Prop.Type} id={Prop.Key} name={Prop.Key} type="checkbox" />
          </label>
        </div>
      )
    }
  }

  useEffect(() => {
    applyUserSettings();
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