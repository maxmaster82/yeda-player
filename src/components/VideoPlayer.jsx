import './VideoPlayer.css';
import { VideoPlayerProvider } from '../contexts/PlayerContext';
import VideoPlayerLayout from './VideoPlayerLayout';

export default function VideoPlayer({ config }) {
  return (
    <VideoPlayerProvider config={config}>
      <VideoPlayerLayout />
    </VideoPlayerProvider>
  );
}
