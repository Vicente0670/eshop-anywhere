import type { SettingInfoLayout } from "../Settings";
import "./Tooltip.css";
import { useEffect, useRef } from "react";

export default function Tooltip({ Id, Description }: SettingInfoLayout) {
  const buttonContainer = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const timeoutId = useRef<number>(0);
  const timestamp = useRef<number>(0);
  const prevDeg = useRef<number>(0);
  const tooltipOpenDelayMs = 500;

  useEffect(() => {

    function showDialog() {
      if (
        !(button.current instanceof HTMLButtonElement) ||
        !(dialog.current instanceof HTMLDialogElement)
      ) return;
      const popover = dialog.current;
      popover.show();
      popover.style.opacity = "1";
      popover.style.transform = "translateY(calc(-50% + var(--popoverContainerDimensions) / 2)) scale(1)";
    }

    function hideDialog() {
      if (!(dialog.current instanceof HTMLDialogElement)) return;
      const popover = dialog.current;
      popover.style.opacity = "0";
      popover.style.transform = "translateY(calc(-50% + var(--popoverContainerDimensions) / 2)) scale(0)";
      popover.close();
    }

    function openDialog(ev: MouseEvent) {
      ev.preventDefault();

      if (ev.type === "click") { 
        skipPulseAnimation();
        timeoutIdClear();
        showDialog();
        radialInfoReset();
      }
      else {
        timeoutId.current = setTimeout(showDialog, tooltipOpenDelayMs);
        timestamp.current = Date.now();
        radialInfoProcess();
      }
    }

    function closeDialog() {
      timeoutIdClear();
      hideDialog();
      radialInfoReset();
    }

    function onFocusDialog() {
      showDialog();
    }

    function onBlurDialog() {
      hideDialog();
    }

    function skipPulseAnimation() {
      const container = buttonContainer.current;
      if (!(container instanceof HTMLDivElement)) return;

      container.getAnimations().forEach(a => a.currentTime = tooltipOpenDelayMs);
    }

    function radialInfoReset() {
      const container = buttonContainer.current;
      if (timeoutId.current === 0 && container instanceof HTMLDivElement) {
        container.style.backgroundImage = `conic-gradient(white 0deg, transparent 0deg)`;
      }
    }

    function radialInfoProcess() {
      if (!(buttonContainer.current instanceof HTMLDivElement)) return;
      if (timeoutId.current) {
        const n = Date.now();
        const deg = ((n - timestamp.current) / tooltipOpenDelayMs) * 360;
        if (deg === prevDeg.current) {
          setTimeout(radialInfoProcess, 1);
          return;
        }
        buttonContainer.current.style.backgroundImage = `conic-gradient(white ${deg}deg, transparent ${deg}deg)`;
        if (deg >= 360) {
          timeoutId.current = 0;
          prevDeg.current = 0;
          radialInfoReset();
          return;
        }
        prevDeg.current = deg;
        setTimeout(radialInfoProcess, 1);
      }
    }

    function timeoutIdClear() {
      clearTimeout(timeoutId.current);
      timeoutId.current = 0;
    }

    const btn = button.current;
    const diag = dialog.current;

    if (btn instanceof HTMLButtonElement) {
      btn.addEventListener("click", openDialog);
      btn.addEventListener("mouseover", openDialog);
      btn.addEventListener("mouseleave", closeDialog);
      btn.addEventListener("focusin", onFocusDialog);
    }

    if (diag instanceof HTMLDialogElement) {
      diag.addEventListener("blur", onBlurDialog);
    }

    return () => {
      btn?.removeEventListener("click", openDialog);
      btn?.removeEventListener("mouseover", openDialog);
      btn?.removeEventListener("mouseleave", closeDialog);
      btn?.removeEventListener("focusin", onFocusDialog);
      diag?.removeEventListener("blur", onBlurDialog);
    }
  });

  return (
    <>
      <div className="buttonContainer" ref={buttonContainer}>
        <button
          role="dialog"
          className="popover"
          type="button"
          popoverTarget={Id}
          popoverTargetAction="toggle"
          ref={button}
        />
      </div>
      <div className="dialogContainer">
        <dialog
          className="popoverTarget"
          id={Id}
          ref={dialog}
          popover="auto"
        >
          <p className="description">
            {Description}
          </p>
        </dialog>
      </div>
    </>
  );
}