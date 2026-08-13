import "./App.css";
import { useEffect, useRef } from "react";
import { Brand, Keys } from "./Constants.ts";

export default function App() {
  const loading = useRef<boolean>(false);
  // to-do: handle loading settings from chrome.storage.sync

  async function toggleMusic() {
    loading.current = true;

    const querySettings = { active: true, currentWindow: true };
    const [currentTab] = await chrome.tabs.query(querySettings);
    if (!currentTab?.id)
      return;

    const userSettings = await chrome.runtime.sendMessage(Keys.Start);
    console.log(userSettings);
    loading.current = false;
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

        <div className="app-settings">
          <button onClick={toggleMusic}>{loading ? "Loading" : "Click to toggle"}</button>
        </div>

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
              ))
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