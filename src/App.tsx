import "./App.css";
import { useEffect, useRef } from "react";
import { Brand } from "./Constants.ts";
import { DefaultSettings } from "./Settings.ts";
import type { SettingsLayout, Settings } from "./Settings.ts";

export default function App() {
  const loading = useRef<boolean>(false);

  function setSettings(
    [Name, Prop]: [
      keyof Settings,
      SettingsLayout
    ]
  ): React.JSX.Element {

    if (Prop.Type === "range") {

      const element = (
        <div className="setting" key={Name}>
          <p className="name">{Prop.Name}</p>
          <label className="label" htmlFor={Prop.Key}>

            <output className="status">0%</output>
            <input
              className="slider"
              type={Prop.Type}
              min={0}
              max={100}
              step={1}
              list="volumePresets"
            />
            <datalist id="volumePresets">
              <option value="0"></option>
              <option value="25"></option>
              <option value="50"></option>
              <option value="75"></option>
              <option value="100"></option>
            </datalist>

          </label>
        </div>
      )
      console.log(element); // tag these elems somehow
      return element;
    }

    else {
      return (
        <div className="setting" key={Name}>
          <p className="name">{Prop.Name}</p>
          <label className="label" htmlFor={Prop.Key}>
            <p className="status" id={Prop.Key}>OFF</p>
            <input className={Prop.Type} name={Prop.Key} type="checkbox" />
          </label>
        </div>
      )
    }

  }

  function test() {
    if (!loading.current) {
      loading.current = true;
    }
  }

  useEffect(test);

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
              Object.entries(DefaultSettings).map(setSettings)
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