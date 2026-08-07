import "./App.css";

export default function App() {
  return (
    <>

      <main className="app-main">
        <div className="title">
          <h1>eShop Anywhere</h1>
        </div>
        <footer className="app-footer">
          <section className="app-footer-title">
            <p className="app-footer-name">eShop Anywhere</p>
            <div className="app-footer-curve-div" />
          </section>
          <section className="app-footer-socials">
            
          </section>
        </footer>
      </main>

      <svg id="app-footer-curve-graphic" height="0" width="0" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id="app-footer-curve-path" maskContentUnits="objectBoundingBox">
            <path d="M 0 0 L 0 1 L 1 1 C 0.5 1 0.5 0 0 0 Z" fill="#fff" />
          </mask>
        </defs>
      </svg>

    </>
  );
}