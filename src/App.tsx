import "./App.css";
import { useState } from "react";
import { Brand, Keys } from "./Constants.ts";

export default function App() {

  const [loading, isLoading] = useState<boolean>(false);

  async function toggleMusic() {
    isLoading(true);

    const options = { active: true, currentWindow: true }
    const [ currentTab ] = await chrome.tabs.query(options);

    if (!currentTab?.id) return;
    
    const res = await chrome.tabs.sendMessage(currentTab.id, Keys.Alert);
    console.log(res);
    isLoading(false);
  }

  console.log("App.tsx : Loaded App.tsx.");

  return (
    <>

      <main className="app-main">

        <div className="app-title">
          <h1>eShop Anywhere</h1>
          <img className="icon" src={Brand.Shop.Icon} alt={Brand.Shop.Alt} draggable={false} />
        </div>

        <div className="app-settings">
          {/* bruh
              i need to clean this up! */}
          <button onClick={toggleMusic}>{loading ? "Loading" : "Click to toggle"}</button>
        </div>

        <footer className="app-footer">
          <section className="title">
            <p className="name">eShop Anywhere</p>
            <div className="curve-div" />
          </section>
          <section className="socials">
            <a href={Brand.Github.Link} title={Brand.Github.Link}>
              <img src={Brand.Github.Icon} alt={Brand.Github.Alt} />
            </a>
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