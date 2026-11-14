import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";

const SITE_URL = "https://www.swayamkrushi.org/";
const VIDEO_URL =
  "https://res.cloudinary.com/ll9equhn/video/upload/f_mp4,q_auto,vc_h264/v1794555592/swayamkrushi/rjmbw2z0gxv3hsurnkou.mp4";

const WELCOME_MS = 5000;
const SITE_MS = 10000;
const CELEBRATE_MS = 2000;

const CONFETTI_COLORS = ["#ff5a5f", "#58c26a", "#4aa3f0", "#f0c13a"];
const CONFETTI_SHAPES = ["dot", "bar", "square", "curve"];

const CONFETTI = Array.from({ length: 56 }, (_, index) => {
  const angle = (index / 56) * Math.PI * 2 + (index % 7) * 0.21;
  const distance = 18 + (index % 9) * 8 + (index % 3) * 4;
  return {
    shape: CONFETTI_SHAPES[index % CONFETTI_SHAPES.length],
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    delay: `${(index % 12) * 0.025}s`,
    duration: `${1.45 + (index % 5) * 0.1}s`,
    rotate: `${(index * 41) % 360}deg`,
    x: `${Math.cos(angle) * distance}vw`,
    y: `${Math.sin(angle) * distance}vh`,
  };
});

function App() {
  const [phase, setPhase] = useState("launch");
  const [celebrating, setCelebrating] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const videoRef = useRef(null);
  const launchBtnRef = useRef(null);
  const celebrateTimerRef = useRef(null);

  const startTour = useCallback(() => {
    if (celebrating || phase !== "launch") return;
    setCelebrating(true);
    clearTimeout(celebrateTimerRef.current);
    celebrateTimerRef.current = setTimeout(() => {
      setCelebrating(false);
      setPhase("welcome");
    }, CELEBRATE_MS);
  }, [celebrating, phase]);

  const goToSite = () => {
    setLeaving(true);
    window.location.href = SITE_URL;
  };

  const playWithAudio = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.defaultMuted = false;
    video.volume = 1;
    const attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => {
        /* Browser may block unmuted autoplay; keep trying quietly */
        video.muted = false;
        video.play().catch(() => {});
      });
    }
  };

  useEffect(() => () => clearTimeout(celebrateTimerRef.current), []);

  // Focus launch button; Enter / Space also start the tour (click still works).
  useEffect(() => {
    if (phase !== "launch") return undefined;
    launchBtnRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      // Native button already activates on Enter/Space when focused.
      if (event.target === launchBtnRef.current) return;
      event.preventDefault();
      startTour();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, celebrating, startTour]);

  // Welcome → site after 5s; site → video after 10s (separate effects so
  // cleanup does not cancel the video timer when entering site).
  useEffect(() => {
    if (phase !== "welcome") return undefined;
    const toSite = setTimeout(() => setPhase("site"), WELCOME_MS);
    return () => clearTimeout(toSite);
  }, [phase]);

  useEffect(() => {
    if (phase !== "site") return undefined;
    const toVideo = setTimeout(() => setPhase("video"), SITE_MS);
    return () => clearTimeout(toVideo);
  }, [phase]);

  useEffect(() => {
    if (phase !== "video") return;
    playWithAudio();
    const retry = setInterval(() => {
      const video = videoRef.current;
      if (!video) return;
      if (!video.paused && !video.muted) {
        clearInterval(retry);
        return;
      }
      playWithAudio();
    }, 400);
    const stop = setTimeout(() => clearInterval(retry), 8000);
    return () => {
      clearInterval(retry);
      clearTimeout(stop);
    };
  }, [phase]);

  return (
    <div
      className={`tour tour--${phase}${leaving ? " tour--leaving" : ""}${
        celebrating ? " tour--celebrate" : ""
      }`}
    >
      <video
        ref={videoRef}
        className={
          phase === "video" ? "player__video" : "player__video player__video--preload"
        }
        src={VIDEO_URL}
        playsInline
        preload="auto"
        autoPlay={phase === "video"}
        muted={false}
        onEnded={goToSite}
        data-phase={phase}
      />

      {celebrating && (
        <div className="celebrate" aria-hidden="true">
          {CONFETTI.map((piece, index) => (
            <span
              key={`${piece.shape}-${index}`}
              className={`celebrate__piece celebrate__piece--${piece.shape}`}
              style={{
                "--c": piece.color,
                "--dx": piece.x,
                "--dy": piece.y,
                "--rot": piece.rotate,
                animationDelay: piece.delay,
                animationDuration: piece.duration,
              }}
            />
          ))}
        </div>
      )}

      {phase === "launch" && (
        <section className="stage stage--launch" aria-label="Start tour">
          <button
            ref={launchBtnRef}
            type="button"
            className={`launch-btn${celebrating ? " launch-btn--fired" : ""}`}
            onClick={startTour}
            disabled={celebrating}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              startTour();
            }}
          >
            Launch Website
          </button>
        </section>
      )}

      {phase === "welcome" && (
        <section className="stage stage--welcome" aria-live="polite">
          <img
            className="welcome-portrait"
            src={`${process.env.PUBLIC_URL}/welcome-portrait.jpg`}
            alt="Portrait of a Swayamkrushi leader in a cream saree with an Indian flag rosette"
          />
          <h1 className="wordmark">
            Welcome to <span className="wordmark__brand">Swayamkrushi</span>{" "}
            website
          </h1>
          <p className="wordmark__link">www.swayamkrushi.org</p>
        </section>
      )}

      {phase === "site" && (
        <section className="site-preview" aria-label="Swayamkrushi website">
          <iframe
            className="site-preview__frame"
            src={SITE_URL}
            title="Swayamkrushi website"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>
      )}
    </div>
  );
}

export default App;
