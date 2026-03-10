const STORAGE_KEY = "bahiavagas_viewed_jobs";

const getViewedJobs = (): Set<string> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

export const markJobAsViewed = (jobId: string) => {
  try {
    const viewed = getViewedJobs();
    viewed.add(jobId);
    // Keep max 500 entries to avoid localStorage bloat
    const arr = Array.from(viewed);
    if (arr.length > 500) arr.splice(0, arr.length - 500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch {
    // silently fail
  }
};

export const isJobViewed = (jobId: string): boolean => {
  return getViewedJobs().has(jobId);
};
