import { useEffect, useRef, useState } from "react";
import "./App.css";

const SITE_URL = "https://www.swayamkrushi.org/";
const VIDEO_URL =
  "https://res.cloudinary.com/ll9equhn/video/upload/f_mp4,q_auto,vc_h264/v1794555592/swayamkrushi/rjmbw2z0gxv3hsurnkou.mp4";

const WELCOME_MS = 5000;
const SITE_MS = 10000;

function App() {
  const [phase, setPhase] = useState("welcome");
  const [progress, setProgress] = useState(0);
  const [needsPlay, setNeedsPlay] = useState(false);
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

  useEffect(() => {
    const toSite = setTimeout(() => {
      setPhase("site");
      const toVideo = setTimeout(() => {
        setPhase("video");
        setProgress(0);
      }, SITE_MS);
      timersRef.current = [toVideo];
    }, WELCOME_MS);
    timersRef.current = [toSite];
    return clearTimers;
  }, []);

  useEffect(() => {
    if (phase !== "video" || !videoRef.current) return;
    const video = videoRef.current;
    video.muted = false;
    video.volume = 1;
    const play = video.play();
    if (play && typeof play.catch === "function") {
      play.catch(() => setNeedsPlay(true));
    }
  }, [phase]);

  const startVideoWithSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    video
      .play()
      .then(() => setNeedsPlay(false))
      .catch(() => setNeedsPlay(true));
  };

  const onTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
  };

  return (
    <div className={`tour tour--${phase}${leaving ? " tour--leaving" : ""}`}>
      {phase === "welcome" && (
        <section className="stage stage--welcome" aria-live="polite">
          <h1 className="stage__welcome">Welcome to Swayamkrushi website</h1>
          <p className="stage__url">https://www.swayamkrushi.org</p>
          <div className="stage__timer" aria-hidden="true">
            <span
              className="stage__timer-bar"
              style={{ animationDuration: `${WELCOME_MS}ms` }}
            />
          </div>
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

      {phase === "video" && (
        <section className="player">
          <div className="player__frame player__frame--full">
            <video
              ref={videoRef}
              className="player__video"
              src={VIDEO_URL}
              playsInline
              autoPlay
              muted={false}
              onTimeUpdate={onTimeUpdate}
              onEnded={goToSite}
            />
            {needsPlay && (
              <button
                type="button"
                className="player__play"
                onClick={startVideoWithSound}
              >
                Play with sound
              </button>
            )}
            <div className="player__progress" aria-hidden="true">
              <div
                className="player__progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
