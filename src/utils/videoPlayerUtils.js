export const formatTime = (seconds) => {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const ss = String(s % 60).padStart(2, '0');
  const mm = String(m % 60).padStart(2, '0');
  if (h > 0) return `${h}:${mm}:${ss}`;
  return `${m}:${ss}`;
};

export const getChapterAtTime = (chapters, time) => {
  return chapters.find((chapter) => time >= chapter.start && time <= chapter.end) || null;
};