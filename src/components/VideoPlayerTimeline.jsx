import { useState, useEffect, useRef } from 'react';
import { formatTime, getChapterAtTime } from '../utils/videoPlayerUtils';
import { useVideoPlayerContext } from '../contexts/PlayerContext';

const TOOLTIP_LEFT_GUARD_PX = 120;
const TOOLTIP_RIGHT_GUARD_PX = 88;

export default function VideoPlayerTimeline() {
  const {
    timelineTrackRef,
    handleTimelineMouseDown,
    seekIfDragging,
    chapters,
    duration,
    chapterSegments,
    timelineTrackWidth,
    thumbLeftPx,
    progress,
  } = useVideoPlayerContext();

  const timelineRef = useRef(null);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverX, setHoverX] = useState(0);
  const [hoverChapter, setHoverChapter] = useState(null);
  const [timelineTrackOffset, setTimelineTrackOffset] = useState(0);

  useEffect(() => {
    const updateOffset = () => {
      if (timelineRef.current && timelineTrackRef.current) {
        const wrapperRect = timelineRef.current.getBoundingClientRect();
        const trackRect = timelineTrackRef.current.getBoundingClientRect();
        setTimelineTrackOffset(trackRect.left - wrapperRect.left);
      }
    };
    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, [timelineTrackRef]);

  const handleMouseMove = (e) => {
    const trackRect = timelineTrackRef.current?.getBoundingClientRect();
    const wrapperRect = timelineRef.current?.getBoundingClientRect();
    if (!trackRect || !wrapperRect || trackRect.width <= 0) return;

    const ratio = Math.max(0, Math.min(1, (e.clientX - trackRect.left) / trackRect.width));
    const time = ratio * duration;
    const xInWrapper = (trackRect.left - wrapperRect.left) + ratio * trackRect.width;

    setHoverTime(time);
    setHoverX(xInWrapper);
    setHoverChapter(getChapterAtTime(chapters, time));
    seekIfDragging(time);
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
    setHoverChapter(null);
  };

  const minTooltipX = timelineTrackOffset + TOOLTIP_LEFT_GUARD_PX;
  const maxTooltipX = timelineTrackOffset + Math.max(timelineTrackWidth, 200) - TOOLTIP_RIGHT_GUARD_PX;
  const clampedTooltipX = Math.min(maxTooltipX, Math.max(minTooltipX, hoverX));

  return (
    <div
      className="timeline-wrapper"
      ref={timelineRef}
      onMouseDown={handleTimelineMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {hoverTime !== null && (
        <div
          className="timeline-tooltip"
          style={{ left: `${clampedTooltipX}px` }}
        >
          {hoverChapter && <span className="tooltip-chapter">{hoverChapter.title}</span>}
          <span className="tooltip-time">{formatTime(hoverTime)}</span>
        </div>
      )}

      <div className="timeline-track" ref={timelineTrackRef}>
        {chapterSegments.map((segment) => (
          <div
            key={segment.key}
            className="chapter-segment"
            style={{ flexGrow: segment.flexGrow }}
          >
            <div className="chapter-buffered" style={{ width: `${segment.bufferedPct}%` }} />
            <div className="chapter-progress" style={{ width: `${segment.playedPct}%` }} />
          </div>
        ))}

        <div
          className="tl-thumb"
          style={{ left: timelineTrackWidth > 0 ? `${thumbLeftPx}px` : `${progress}%` }}
        />
      </div>
    </div>
  );
}
