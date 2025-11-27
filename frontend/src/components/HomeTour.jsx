// HomeTour.jsx
import React, { useEffect, useRef } from "react";
import { TourProvider, useTour } from "@reactour/tour";

/**
 * Steps for the tour — targets must exist in the page:
 * #upload-btn, #retrieve-btn, #view-card, #settings-card
 */
const steps = [
  { selector: "#upload-btn", content: "Click here to upload a resume file.", position: "bottom" },
  { selector: "#retrieve-btn", content: "Click here to retrieve previously uploaded resumes.", position: "bottom" },
  { selector: "#view-card", content: "View all the resumes here.", position: "top" },
  { selector: "#settings-card", content: "Access settings to customize your experience.", position: "top" },
];

/**
 * TourController:
 * - auto-starts the tour
 * - locks scrolling while the tour is open using a robust technique (position:fixed)
 * - prevents wheel/touch/key scrolling events while tour is open
 * - restores scroll & position when the tour closes
 *
 * This component uses inline style changes only (no external CSS), and keeps state/local refs
 * so all scroll-lock logic stays in this file.
 */
function TourController() {
  const { isOpen, setIsOpen } = useTour();
  const scrollYRef = useRef(0);
  const handlersRef = useRef({});

  // auto open the tour shortly after mount (gives page time to render)
  useEffect(() => {
    const t = setTimeout(() => setIsOpen(true), 450);
    return () => clearTimeout(t);
  }, [setIsOpen]);

  useEffect(() => {
    // preventDefault helper
    const preventDefault = (e) => {
      // allow interactions with the tour UI itself (pointer events), but
      // prevent default scroll behaviors
      e.preventDefault();
    };

    const preventKeys = (e) => {
      // prevent keys that cause page scroll
      // Space ( ), ArrowUp/Down, PageUp/PageDown, Home/End
      const scrollKeys = [
        " ",
        "Spacebar", // older browsers
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
      ];
      if (scrollKeys.includes(e.key)) {
        e.preventDefault();
      }
    };

    handlersRef.current.preventDefault = preventDefault;
    handlersRef.current.preventKeys = preventKeys;

    if (isOpen) {
      // store current scroll position
      scrollYRef.current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

      // lock scroll by fixing the body and keeping current scroll position
      const docEl = document.documentElement;
      const body = document.body;

      // Inline style changes to lock page scroll
      docEl.style.overflow = "hidden"; // hide scrollbar for html
      body.style.position = "fixed";
      body.style.top = `-${scrollYRef.current}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";

      // Add event listeners to block wheel / touchmove / key scroll events
      window.addEventListener("wheel", preventDefault, { passive: false });
      window.addEventListener("touchmove", preventDefault, { passive: false });
      window.addEventListener("keydown", preventKeys, { passive: false });
    } else {
      // restore scroll & remove listeners
      const body = document.body;
      const docEl = document.documentElement;

      // Clear inline styles we added
      docEl.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";

      // remove listeners (safe even if not previously added)
      window.removeEventListener("wheel", handlersRef.current.preventDefault);
      window.removeEventListener("touchmove", handlersRef.current.preventDefault);
      window.removeEventListener("keydown", handlersRef.current.preventKeys);

      // restore original scroll position
      const y = scrollYRef.current || 0;
      window.scrollTo(0, y);
    }

    // cleanup if component unmounts
    return () => {
      window.removeEventListener("wheel", handlersRef.current.preventDefault);
      window.removeEventListener("touchmove", handlersRef.current.preventDefault);
      window.removeEventListener("keydown", handlersRef.current.preventKeys);

      // ensure styles restored on unmount too
      const body = document.body;
      const docEl = document.documentElement;
      docEl.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";
      const y = scrollYRef.current || 0;
      window.scrollTo(0, y);
    };
  }, [isOpen, setIsOpen]);

  return null;
}

/**
 * HomeTour — the exported component. Everything styled inline via the `styles` prop.
 * afterClose also restores scroll as a safety net.
 */
export default function HomeTour() {
  // safety unlock function executed after the tour closes via the provider
  const handleAfterClose = () => {
    const docEl = document.documentElement;
    const body = document.body;
    // Restore styles (defensive)
    docEl.style.overflow = "";
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    body.style.overflow = "";
    // restore scroll if we stored it earlier (TourController sets window._homeTourScrollY)
    const y = window.__homeTourScrollY || 0;
    window.scrollTo(0, y);
  };

  return (
    <TourProvider
      steps={steps}
      showNavigation
      showBadge
      showDots
      scrollSmooth
      showCloseButton
      disableKeyboardNavigation={false}
      afterClose={handleAfterClose} // extra safety: restore styles when tour finishes
      styles={{
        popover: (base) => ({
          ...base,
          backgroundColor: "#fff8e1",
          color: "#1a1a1a",
          borderRadius: "12px",
          padding: "18px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
          maxWidth: "340px",
          zIndex: 2147483647,
        }),
        maskArea: (base) => ({
          ...base,
          stroke: "#FFD700",
          strokeWidth: 3,
          filter: "drop-shadow(0 0 10px rgba(255,215,0,0.65))",
        }),
        badge: (base) => ({
          ...base,
          backgroundColor: "#FFD700",
          color: "#000",
          fontWeight: "700",
        }),
        controls: (base) => ({
          ...base,
          color: "#FFD700",
          fontWeight: "700",
        }),
        close: (base) => ({
          ...base,
          color: "#000",
          fontSize: "18px",
          position: "absolute",
          top: "8px",
          right: "10px",
          cursor: "pointer",
        }),
      }}
    >
      <TourController />
    </TourProvider>
  );
}
