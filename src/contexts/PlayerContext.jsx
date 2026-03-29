import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const VideoPlayerContext = createContext(null);

export function VideoPlayerProvider({ config, children }) {
  const { hlsPlaylistUrl, videoLength, chapters } = config;
  const safeChapters = chapters ?? [];

  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const timelineTrackRef = useRef(null);
  const controlsTimerRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(videoLength);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [timelineTrackWidth, setTimelineTrackWidth] = useState(0);
  const [thumbLeftPx, setThumbLeftPx] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({ startLevel: -1 });
      hlsRef.current = hls;
      hls.loadSource(hlsPlaylistUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setLevels(data.levels);
        setIsLoading(false);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setCurrentLevel(data.level);
      });

      return () => hls.destroy();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsPlaylistUrl;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
    }
  }, [hlsPlaylistUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const onDurationChange = () => setDuration(video.duration || videoLength);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('volumechange', onVolumeChange);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('volumechange', onVolumeChange);
    };
  }, [videoLength]);

  useEffect(() => {
    const updateTimelineWidth = () => {
      setTimelineTrackWidth(timelineTrackRef.current?.offsetWidth || 0);
    };
    updateTimelineWidth();
    window.addEventListener('resize', updateTimelineWidth);

    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFSChange);

    return () => {
      window.removeEventListener('resize', updateTimelineWidth);
      document.removeEventListener('fullscreenchange', onFSChange);
    };
  }, []);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimerRef.current);
    if (isPlaying) {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  const getTimeFromEvent = (e) => {
    const rect = timelineTrackRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return 0;
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    return ratio * duration;
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  };

  const handleTimelineMouseDown = (e) => {
    setIsDragging(true);
    const seekTime = getTimeFromEvent(e);
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const seekIfDragging = (time) => {
    if (!isDragging) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleTimelineMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleTimelineMouseUp);
    }
    return () => window.removeEventListener('mouseup', handleTimelineMouseUp);
  }, [isDragging]);

  const toggleMute = () => {
    videoRef.current.muted = !videoRef.current.muted;
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    videoRef.current.volume = v;
    videoRef.current.muted = v === 0;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleQualityChange = (levelIndex) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentLevel(levelIndex);
    }
  };

  const handleContainerMouseLeave = () => {
    if (isPlaying) setShowControls(false);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const safeDuration = duration > 0 ? duration : videoLength;
  const timelineChapters = safeChapters.length
    ? safeChapters
    : [{ start: 0, end: safeDuration, title: 'Full video' }];

  const chapterSegments = timelineChapters.map((chapter, i) => {
    const start = Math.max(0, chapter.start ?? 0);
    const nextStart = i < timelineChapters.length - 1
      ? Math.max(start, timelineChapters[i + 1].start ?? safeDuration)
      : safeDuration;
    const end = Math.max(start, nextStart);
    const segmentDuration = Math.max(0.001, end - start);
    const playedDuration = Math.max(0, Math.min(currentTime, end) - start);
    const bufferedDuration = Math.max(0, Math.min(buffered, end) - start);

    return {
      key: `${start}-${end}-${i}`,
      start,
      end,
      segmentDuration,
      flexGrow: segmentDuration / Math.max(safeDuration, 0.001),
      playedPct: (playedDuration / segmentDuration) * 100,
      bufferedPct: (bufferedDuration / segmentDuration) * 100,
    };
  });

  useEffect(() => {
    let frameId = 0;
    const scheduleThumbUpdate = (value) => {
      frameId = window.requestAnimationFrame(() => {
        setThumbLeftPx(value);
      });
    };

    const trackEl = timelineTrackRef.current;
    if (!trackEl || timelineTrackWidth <= 0 || chapterSegments.length === 0) {
      scheduleThumbUpdate(0);
      return () => window.cancelAnimationFrame(frameId);
    }

    const segmentEls = trackEl.querySelectorAll('.chapter-segment');
    if (!segmentEls.length) {
      const fallback = (duration > 0 ? (currentTime / duration) : 0) * timelineTrackWidth;
      scheduleThumbUpdate(Math.max(0, Math.min(timelineTrackWidth, fallback)));
      return () => window.cancelAnimationFrame(frameId);
    }

    let nextThumbLeft = timelineTrackWidth;

    for (let i = 0; i < chapterSegments.length; i += 1) {
      const segment = chapterSegments[i];
      const segmentEl = segmentEls[i];
      if (!segmentEl) continue;

      const segmentStartX = segmentEl.offsetLeft;
      const segmentWidth = segmentEl.offsetWidth;

      if (currentTime >= segment.end) {
        nextThumbLeft = segmentStartX + segmentWidth;
        continue;
      }

      if (currentTime <= segment.start) {
        nextThumbLeft = segmentStartX;
      } else {
        const ratioInSegment = (currentTime - segment.start) / segment.segmentDuration;
        nextThumbLeft = segmentStartX + (segmentWidth * Math.max(0, Math.min(1, ratioInSegment)));
      }
      break;
    }

    scheduleThumbUpdate(Math.max(0, Math.min(timelineTrackWidth, nextThumbLeft)));
    return () => window.cancelAnimationFrame(frameId);
  }, [chapterSegments, currentTime, duration, timelineTrackWidth]);

  const value = {
    timelineTrackRef,
    handleTimelineMouseDown,
    seekIfDragging,
    isDragging,
    chapters: safeChapters,
    chapterSegments,
    timelineTrackWidth,
    thumbLeftPx,
    progress,
    isPlaying,
    togglePlay,
    isMuted,
    volume,
    toggleMute,
    handleVolumeChange,
    currentTime,
    duration,
    levels,
    currentLevel,
    handleQualityChange,
    isFullscreen,
    toggleFullscreen,
    containerRef,
    videoRef,
    showControls,
    resetControlsTimer,
    handleContainerMouseLeave,
    isLoading,
  };

  return <VideoPlayerContext.Provider value={value}>{children}</VideoPlayerContext.Provider>;
}

export function useVideoPlayerContext() {
  const context = useContext(VideoPlayerContext);
  if (!context) {
    throw new Error('useVideoPlayerContext must be used within a VideoPlayerProvider');
  }
  return context;
}
