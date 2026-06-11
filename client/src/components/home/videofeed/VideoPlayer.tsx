import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  PictureInPicture,
  Loader2,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
  AlertCircle,
  ChevronsRight,
  ChevronsLeft,
} from "lucide-react";

const formatTime = (timeInSeconds) => {
  if (!timeInSeconds) return "0:00";
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

/**
 * Reusable Video Player Component
 * * @param {string} videoUrl - Source URL for the video (Required)
 * @param {boolean} autoplay - Auto start video on load (Default: true)
 * @param {boolean} replay - Auto loop video on end (Default: false)
 * @param {string} theme - 'dark' | 'light' (Default: 'dark')
 * @param {string} color - Primary accent color hex code (Default: '#7c3aed')
 * @param {boolean} fit - If true, video fits within container (contain). If false, it fills (cover). (Default: true)
 */
const VideoPlayer = ({
  videoUrl,
  autoplay = true,
  replay = false,
  theme = "dark",
  color = "#7c3aed",
  fit = true,
  className = "",
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const speedMenuRef = useRef(null);

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(!autoplay);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [isCover, setIsCover] = useState(!fit);
  const [error, setError] = useState(false);

  // Feedback UI State
  const [volumeOverlay, setVolumeOverlay] = useState({
    show: false,
    value: 0,
  });
  const [skipFeedback, setSkipFeedback] = useState({
    show: false,
    direction: null,
    fadingOut: false,
  });

  // Refs
  const volumeTimeoutRef = useRef(null);
  const clickTimeoutRef = useRef(null);
  const lastClickTimeRef = useRef(0);
  let controlsTimeout = useRef(null);

  // --- Theme Config ---
  const isDark = theme === "dark";

  const themeStyles = {
    container: isDark ? "bg-black" : "bg-white",
    iconBase: isDark ? "text-white" : "text-neutral-800",
    iconHover: isDark ? "hover:text-white" : "hover:text-black",
    iconDim: isDark ? "text-neutral-400" : "text-neutral-500",
    toolbarBg: isDark
      ? "bg-neutral-900/90 border-white/5"
      : "bg-white/90 border-black/5",
    progressBarBg: isDark ? "bg-white/10" : "bg-black/10",
    bufferedBarBg: isDark ? "bg-white/20" : "bg-black/20",
    menuBg: isDark
      ? "bg-neutral-900/95 border-white/10"
      : "bg-white/95 border-black/10",
    menuText: isDark ? "text-neutral-300" : "text-neutral-600",
    menuHover: isDark ? "hover:bg-white/10" : "hover:bg-black/5",
    overlayBg: isDark ? "bg-black/60" : "bg-white/80",
    overlayText: isDark ? "text-white" : "text-black",
  };

  // --- Initialization ---

  useEffect(() => {
    if (autoplay && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((error) => {
            console.log("Autoplay prevented:", error);
            setIsPlaying(false);
            setShowControls(true);
            // Browser policy might block unmuted autoplay.
          });
      }
    }
  }, [autoplay, videoUrl]);

  useEffect(() => {
    setIsCover(!fit);
  }, [fit]);

  // --- Event Handlers ---

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (isEnded) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsEnded(false);
    } else if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  }, [isPlaying, isEnded]);

  const toggleFit = () => {
    setIsCover(!isCover);
  };

  const showVolumeFeedback = (val) => {
    setVolumeOverlay({ show: true, value: val });
    if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
    volumeTimeoutRef.current = setTimeout(() => {
      setVolumeOverlay((prev) => ({ ...prev, show: false }));
    }, 1000);
  };

  const handleVolumeChange = (e, newVol = null) => {
    let vol = newVol !== null ? newVol : parseFloat(e.target.value);
    vol = Math.max(0, Math.min(1, vol));

    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    videoRef.current.muted = newMutedState;
    if (newMutedState) {
      setVolume(0);
      showVolumeFeedback(0);
    } else {
      setVolume(1);
      showVolumeFeedback(1);
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const seekTime = parseFloat(e.target.value);
    videoRef.current.currentTime = seekTime;
    setProgress(seekTime);
    setIsBuffering(true);
    if (isEnded) setIsEnded(false);
  };

  const skip = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += seconds;
    if (isEnded) setIsEnded(false);
  };

  // --- Smart Click Handler ---
  const handleSmartClick = (e) => {
    // If error or no video, ignore
    if (error || !videoUrl) return;

    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    lastClickTimeRef.current = now;

    if (timeSinceLastClick < 300) {
      clearTimeout(clickTimeoutRef.current);
      if (x < width * 0.35) {
        skip(-10);
        triggerSkipFeedback("backward");
      } else if (x > width * 0.65) {
        skip(10);
        triggerSkipFeedback("forward");
      } else {
        toggleFullscreen();
      }
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        togglePlay();
      }, 300);
    }
  };

  const triggerSkipFeedback = (direction) => {
    setSkipFeedback({ show: false, direction: null, fadingOut: false });
    setTimeout(() => {
      setSkipFeedback({ show: true, direction, fadingOut: false });
      setTimeout(() => {
        setSkipFeedback((prev) => ({ ...prev, fadingOut: true }));
        setTimeout(() => {
          setSkipFeedback({
            show: false,
            direction: null,
            fadingOut: false,
          });
        }, 300);
      }, 500);
    }, 10);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress(videoRef.current.currentTime);
      if (videoRef.current.buffered.length > 0) {
        const bufferedEnd = videoRef.current.buffered.end(
          videoRef.current.buffered.length - 1,
        );
        setBuffered((bufferedEnd / videoRef.current.duration) * 100);
      }
    }
  };

  const onEnded = () => {
    if (replay) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    } else {
      setIsPlaying(false);
      setIsEnded(true);
      setShowControls(true);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const changePlaybackSpeed = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
    }
  };

  // --- Effects ---

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showSpeedMenu &&
        speedMenuRef.current &&
        !speedMenuRef.current.contains(event.target)
      ) {
        setShowSpeedMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSpeedMenu]);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      if (showSpeedMenu || isEnded || !isPlaying) return;
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", () => {
        if (!showSpeedMenu && !isEnded) setShowControls(false);
      });
      container.addEventListener("touchstart", handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", () =>
          setShowControls(false),
        );
        container.removeEventListener("touchstart", handleMouseMove);
      }
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, [showSpeedMenu, isEnded, isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT") return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          toggleMute();
          break;
        case "arrowright":
          skip(5);
          break;
        case "arrowleft":
          skip(-5);
          break;
        case "arrowup":
          e.preventDefault();
          setVolume((prev) => {
            const newVol = Math.min(1, prev + 0.1);
            if (videoRef.current) {
              videoRef.current.volume = newVol;
              setIsMuted(newVol === 0);
            }
            showVolumeFeedback(newVol);
            return newVol;
          });
          break;
        case "arrowdown":
          e.preventDefault();
          setVolume((prev) => {
            const newVol = Math.max(0, prev - 0.1);
            if (videoRef.current) {
              videoRef.current.volume = newVol;
              setIsMuted(newVol === 0);
            }
            showVolumeFeedback(newVol);
            return newVol;
          });
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay]);

  const getVolumeIcon = () => {
    if (isMuted || volume === 0)
      return <VolumeX size={20} className={themeStyles.iconBase} />;
    if (volume < 0.5)
      return <Volume1 size={20} className={themeStyles.iconBase} />;
    return <Volume2 size={20} className={themeStyles.iconBase} />;
  };

  // Edge Case: No URL
  if (!videoUrl) {
    return (
      <div
        className={`w-full aspect-video flex flex-col items-center justify-center border bg-neutral-900 border-neutral-800 ${className}`}
      >
        <AlertCircle
          size={48}
          className={isDark ? "text-neutral-700" : "text-gray-400"}
        />
        <span
          className={`mt-4 font-medium ${isDark ? "text-neutral-500" : "text-gray-500"}`}
        >
          No Video Source Provided
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative group select-none ${themeStyles.container} ${className}`}
      onClick={handleSmartClick}
    >
      <video
        ref={videoRef}
        className={`w-full h-full bg-black ${isCover ? "object-cover" : "object-contain"}`}
        src={videoUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current.duration)}
        onWaiting={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
          setIsEnded(false);
        }}
        onEnded={onEnded}
        onSeeked={() => setIsBuffering(false)}
        onError={() => setError(true)}
        playsInline
      />

      {/* --- Error State --- */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50">
          <AlertCircle size={48} className="text-red-500 mb-2" />
          <span className="text-white font-medium">Error Loading Video</span>
        </div>
      )}

      {/* --- Overlays --- */}

      {/* Skip Feedback Animation */}
      {skipFeedback.show && (
        <div
          className={`absolute top-0 bottom-0 flex items-center justify-center w-1/3 z-20 backdrop-blur-[2px] transition-opacity duration-300 ${isDark ? "bg-white/10" : "bg-black/10"} ${skipFeedback.fadingOut ? "opacity-0" : "opacity-100 animate-in fade-in"} ${skipFeedback.direction === "backward" ? "left-0 rounded-r-[50%]" : "right-0 rounded-l-[50%]"}`}
        >
          <div
            className={`flex flex-col items-center ${isDark ? "text-white/90" : "text-black/80"}`}
          >
            {skipFeedback.direction === "backward" ? (
              <>
                <ChevronsLeft size={48} className="animate-pulse" />
                <span className="font-bold text-sm">-10s</span>
              </>
            ) : (
              <>
                <ChevronsRight size={48} className="animate-pulse" />
                <span className="font-bold text-sm">+10s</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Buffering Spinner */}
      {isBuffering && !isEnded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 pointer-events-none">
          <Loader2
            className="w-12 h-12 animate-spin"
            style={{ color: color }}
          />
        </div>
      )}

      {/* Volume Overlay Feedback */}
      {volumeOverlay.show && (
        <div
          className={`absolute top-8 left-1/2 -translate-x-1/2 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium z-21 flex items-center gap-2 animate-in fade-in zoom-in duration-200 ${themeStyles.overlayBg} ${themeStyles.overlayText}`}
        >
          {volumeOverlay.value === 0 ? (
            <VolumeX size={16} />
          ) : (
            <Volume2 size={16} />
          )}
          <span>{Math.round(volumeOverlay.value * 100)}%</span>
        </div>
      )}

      {/* Center Controls (Pause/Play/Replay + Skips) */}
      {(!isPlaying && !isBuffering && showControls && !error) || isEnded ? (
        <div className="absolute inset-0 hidden sm:flex items-center justify-center bg-black/40 z-10 transition-opacity duration-300">
          <div className="flex items-center gap-6 sm:gap-8">
            {/* Previous 5s */}
            {!isEnded && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  skip(-5);
                }}
                className={`cursor-pointer flex items-center justify-center p-1.5 sm:p-2 rounded-full backdrop-blur-sm active:scale-95 transition-all w-8 h-8 sm:w-10 sm:h-10 group/skip ${isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/10 hover:bg-black/20 text-white"}`}
              >
                <div className="relative">
                  <RotateCcw
                    size={16}
                    className="sm:w-5 sm:h-5"
                    strokeWidth={1.5}
                  />
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] text-[7px] sm:text-[8px] font-bold mt-px">
                    5
                  </span>
                </div>
              </button>
            )}

            {/* Main Play / Replay Button */}
            <div
              className="flex flex-col items-center justify-center cursor-pointer group/replay"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
            >
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,0,0,0.3)]"
                style={{ backgroundColor: color }}
              >
                {isEnded ? (
                  // <RotateCcw size={20} fill="white" className="text-white sm:w-6 sm:h-6 group-hover/replay:rotate-180 transition-transform duration-500" />
                  <RotateCw
                    size={20}
                    fill="none"
                    className="text-white sm:w-6 sm:h-6 group-hover/replay:rotate-180 transition-transform duration-500"
                  />
                ) : (
                  <Play
                    size={20}
                    fill="white"
                    className="ml-1 text-white sm:w-6 sm:h-6"
                  />
                )}
              </div>
              {isEnded && (
                <span className="mt-2 text-xs sm:text-sm font-semibold tracking-wide text-white drop-shadow-md animate-in fade-in slide-in-from-top-1">
                  Replay
                </span>
              )}
            </div>

            {/* Next 5s */}
            {!isEnded && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  skip(5);
                }}
                className={`cursor-pointer flex items-center justify-center p-1.5 sm:p-2 rounded-full backdrop-blur-sm active:scale-95 transition-all w-8 h-8 sm:w-10 sm:h-10 group/skip ${isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/10 hover:bg-black/20 text-white"}`}
              >
                <div className="relative">
                  <RotateCw
                    size={16}
                    className="sm:w-5 sm:h-5"
                    strokeWidth={1.5}
                  />
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] text-[7px] sm:text-[8px] font-bold mt-px">
                    5
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* --- Bottom Toolbar --- */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-2 md:p-6 mb-0 sm:mb-2 transition-all duration-500 ease-out z-22 ${showControls && !error ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Control Island */}
        <div
          className={`backdrop-blur-md border rounded-xl sm:rounded-2xl px-2 sm:px-6 py-1 sm:py-4 shadow-2xl relative w-full ${themeStyles.toolbarBg}`}
        >
          {/* Progress Bar */}
          <div className="group/progress relative w-full h-1 sm:h-1 cursor-pointer flex items-center mb-1.5 sm:mb-4 hover:h-2 touch-none transition-all duration-200">
            <div
              className={`absolute w-full h-full rounded-full overflow-hidden ${themeStyles.progressBarBg}`}
            >
              <div
                className={`absolute top-0 left-0 h-full ${themeStyles.bufferedBarBg}`}
                style={{ width: `${buffered}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={progress}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            <div
              className="absolute top-0 left-0 h-full rounded-full pointer-events-none z-10"
              style={{
                width: `${(progress / duration) * 100}%`,
                backgroundColor: color,
              }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-white rounded-full shadow-[0_0_10px_rgba(0,0,0,0.3)] scale-0 group-hover/progress:scale-100 transition-transform" />
            </div>
          </div>

          {/* Controls Grid */}
          <div className="flex items-center justify-between gap-1 sm:gap-0">
            {/* LEFT: Play, Skip, Volume */}
            <div className="flex items-center gap-1 sm:gap-4">
              <button
                onClick={togglePlay}
                className={`cursor-pointer transition-colors p-0.5 sm:p-0 ${themeStyles.iconBase} ${themeStyles.iconHover}`}
              >
                {isEnded ? (
                  <RotateCcw size={16} className="sm:w-[22px] sm:h-[22px]" />
                ) : isPlaying ? (
                  <Pause
                    size={16}
                    className="sm:w-[22px] sm:h-[22px]"
                    fill="currentColor"
                  />
                ) : (
                  <Play
                    size={16}
                    className="sm:w-[22px] sm:h-[22px]"
                    fill="currentColor"
                  />
                )}
              </button>

              {/* Toolbar Skip Buttons */}
              <div className="hidden sm:flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => skip(-5)}
                  className={`cursor-pointer transition-colors p-1 flex items-center justify-center ${themeStyles.iconDim} ${themeStyles.iconHover}`}
                >
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <RotateCcw size={20} strokeWidth={2} />
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold mt-px">
                      5
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => skip(5)}
                  className={`cursor-pointer transition-colors p-1 flex items-center justify-center ${themeStyles.iconDim} ${themeStyles.iconHover}`}
                >
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <RotateCw size={20} strokeWidth={2} />
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold mt-px">
                      5
                    </span>
                  </div>
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center group/vol relative h-full">
                <button
                  onClick={toggleMute}
                  className={`cursor-pointer transition-colors z-10 p-0.5 sm:p-0 ${themeStyles.iconDim} ${themeStyles.iconHover}`}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX
                      size={16}
                      className={`sm:w-5 sm:h-5 ${themeStyles.iconBase}`}
                    />
                  ) : volume < 0.5 ? (
                    <Volume1
                      size={16}
                      className={`sm:w-5 sm:h-5 ${themeStyles.iconBase}`}
                    />
                  ) : (
                    <Volume2
                      size={16}
                      className={`sm:w-5 sm:h-5 ${themeStyles.iconBase}`}
                    />
                  )}
                </button>
                <div className="w-0 overflow-hidden group-hover/vol:w-16 sm:group-hover/vol:w-20 transition-all duration-300 ease-out origin-left ml-1 flex items-center h-5 sm:h-6">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    style={{
                      background: `linear-gradient(to right, ${color} ${volume * 100}%, ${isDark ? "#404040" : "#d1d5db"} ${volume * 100}%)`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT: Time, Speed, PiP, Fullscreen */}
            <div className="flex items-center gap-1 sm:gap-4">
              {/* Time & Speed */}
              <div
                className={`flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-mono ${themeStyles.iconDim}`}
              >
                <span>
                  {formatTime(progress)} / {formatTime(duration)}
                </span>

                {/* Speed Indicator */}
                <div className="relative" ref={speedMenuRef}>
                  {showSpeedMenu && (
                    <div
                      className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 border rounded-lg overflow-hidden flex flex-col p-0.5 min-w-9 sm:min-w-[50px] shadow-xl backdrop-blur-md ${themeStyles.menuBg}`}
                    >
                      {[2, 1.5, 1.25, 1, 0.5].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => changePlaybackSpeed(speed)}
                          className={`cursor-pointer px-1 py-1 rounded text-[9px] sm:text-xs font-medium transition-colors text-center ${playbackSpeed === speed ? "bg-black/5 dark:bg-white/5 font-bold" : ""} ${themeStyles.menuText} ${themeStyles.menuHover}`}
                          style={
                            playbackSpeed === speed
                              ? {
                                  color: color,
                                }
                              : {}
                          }
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSpeedMenu(!showSpeedMenu);
                    }}
                    className={`px-1 py-0.5 rounded transition-colors cursor-pointer ${themeStyles.menuHover} text-[9px] sm:text-xs`}
                    style={{
                      color: color,
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.05)",
                    }}
                  >
                    {playbackSpeed}x
                  </button>
                </div>
              </div>

              <div
                className={`w-px h-4 hidden sm:block ${isDark ? "bg-white/10" : "bg-black/10"}`}
              ></div>

              <button
                onClick={togglePiP}
                className={`cursor-pointer transition-colors hidden sm:block p-0.5 sm:p-0 ${themeStyles.iconDim} ${themeStyles.iconHover}`}
                title="Picture in Picture"
              >
                <PictureInPicture size={16} className="sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={toggleFit}
                className={`cursor-pointer transition-colors p-0.5 sm:p-0 ${themeStyles.iconDim} ${themeStyles.iconHover}`}
                title={isCover ? "Fit to Screen" : "Fill Screen"}
              >
                {isCover ? (
                  <Minimize2 size={16} className="sm:w-5 sm:h-5" />
                ) : (
                  <Maximize2 size={16} className="sm:w-5 sm:h-5" />
                )}
              </button>

              <button
                onClick={toggleFullscreen}
                className={`cursor-pointer transition-colors p-0.5 sm:p-0 ${themeStyles.iconDim} ${themeStyles.iconHover}`}
                title="Fullscreen"
              >
                {isFullscreen ? (
                  <Minimize size={16} className="sm:w-5 sm:h-5" />
                ) : (
                  <Maximize size={16} className="sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
