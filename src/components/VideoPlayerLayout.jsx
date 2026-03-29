import VideoPlayerTimeline from './VideoPlayerTimeline';
import VideoPlayerControls from './VideoPlayerControls';
import { useVideoPlayerContext } from '../contexts/PlayerContext';

export default function VideoPlayerLayout() {
  const {
    showControls,
    isPlaying,
    containerRef,
    resetControlsTimer,
    handleContainerMouseLeave,
    videoRef,
    togglePlay,
    isLoading,
  } = useVideoPlayerContext();

  return (
    <div
      className={`player-container ${showControls || !isPlaying ? 'controls-visible' : ''}`}
      ref={containerRef}
      onMouseMove={resetControlsTimer}
      onMouseLeave={handleContainerMouseLeave}
    >
      <video
        ref={videoRef}
        className="player-video"
        onClick={togglePlay}
        playsInline
      />

      {isLoading && (
        <div className="player-spinner">
          <div className="spinner-ring" />
        </div>
      )}

      <div className="player-controls">
        <VideoPlayerTimeline />
        <VideoPlayerControls />
      </div>
    </div>
  );
}
