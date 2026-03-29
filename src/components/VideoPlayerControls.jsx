import { useState } from 'react';
import {
  PlayIcon,
  PauseIcon,
  VolumeIcon,
  MuteIcon,
  SettingsIcon,
  FullscreenIcon,
  ExitFullscreenIcon,
  CheckIcon,
} from './VideoPlayerIcons';
import { formatTime } from '../utils/videoPlayerUtils';
import { useVideoPlayerContext } from '../contexts/PlayerContext';

export default function VideoPlayerControls() {
  const {
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
  } = useVideoPlayerContext();

  const [showVolume, setShowVolume] = useState(false);
  const [showQuality, setShowQuality] = useState(false);

  const onQualitySelect = (levelIndex) => {
    handleQualityChange(levelIndex);
    setShowQuality(false);
  };

  return (
    <div className="controls-bar">
      <div className="controls-left">
        <button className="ctrl-btn" onClick={togglePlay}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div
          className={`volume-group ${showVolume ? 'open' : ''}`}
          onMouseEnter={() => setShowVolume(true)}
          onMouseLeave={() => setShowVolume(false)}
        >
          <button className="ctrl-btn" onClick={toggleMute}>
            {isMuted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
          </button>

          <div className="vol-slider-wrap">
            <input
              type="range"
              className="vol-slider"
              min="0"
              max="1"
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
            />
          </div>
        </div>

        <div className="time-display">
          <span>{formatTime(currentTime)}</span>
          <span className="sep">/</span>
          <span className="total">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="controls-right">
        <div className="quality-wrapper">
          <button className="ctrl-btn" onClick={() => setShowQuality((v) => !v)}>
            <SettingsIcon />
          </button>

          {showQuality && (
            <div className="quality-menu">
              <div className="quality-title">Quality</div>

              <button
                className={`q-option ${currentLevel === -1 ? 'active' : ''}`}
                onClick={() => onQualitySelect(-1)}
              >
                <span>Auto</span>
                {currentLevel === -1 && <CheckIcon />}
              </button>

              {[...levels].map((_, i) => {
                const idx = levels.length - 1 - i;
                const lvl = levels[idx];

                return (
                  <button
                    key={idx}
                    className={`q-option ${currentLevel === idx ? 'active' : ''}`}
                    onClick={() => onQualitySelect(idx)}
                  >
                    <span>
                      {lvl.height}p
                      {lvl.height >= 1080 ? ' HD' : ''}
                    </span>
                    {currentLevel === idx && <CheckIcon />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button className="ctrl-btn" onClick={toggleFullscreen}>
          {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
        </button>
      </div>
    </div>
  );
}