import { useEffect, useRef, useState } from "react";
import "./App.css";

const SITE_URL = "https://www.swayamkrushi.org/";
const VIDEO_URL =
  "https://res.cloudinary.com/ll9equhn/video/upload/f_mp4,q_auto,vc_h264/v1794555592/swayamkrushi/rjmbw2z0gxv3hsurnkou.mp4";

const WELCOME_MS = 5000;
const SITE_MS = 10000;

function App() {
  const [phase, setPhase] = useState("welcome");
  const [leaving, setLeaving] = useState(false);
  const videoRef = useRef(null);
  const timersRef = useRef([]);
  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const goToSite = () => {
    clearTimers();
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

  useEffect(() => {
    const toSite = setTimeout(() => {
      setPhase("site");
      const toVideo = setTimeout(() => {
        setPhase("video");
      }, SITE_MS);
      timersRef.current = [toVideo];
    }, WELCOME_MS);
    timersRef.current = [toSite];
    return clearTimers;
  }, []);

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
    <div className={`tour tour--${phase}${leaving ? " tour--leaving" : ""}`}>
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

      {phase === "welcome" && (
        <section className="stage stage--welcome" aria-live="polite">
          <h1 className="wordmark">
            Welcome to <span className="wordmark__brand">Swayamkrushi</span>{" "}
            website
          </h1>
          <p className="wordmark__link">https://www.swayamkrushi.org</p>
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
