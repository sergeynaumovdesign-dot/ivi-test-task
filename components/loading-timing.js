// Delay only the loading UI, never playback or media events.
export function createLoadingTiming(onVisibilityChange) {
  let loading = false, visible = false, shownAt = 0, showTimer = null, hideTimer = null;
  function clearTimers() {
    clearTimeout(showTimer); clearTimeout(hideTimer);
    showTimer = hideTimer = null;
  }
  function hide() {
    hideTimer = null;
    if (loading || !visible) return;
    visible = false; onVisibilityChange(false);
  }
  return {
    setLoading(next) {
      next = Boolean(next);
      if (loading === next) return;
      loading = next;
      clearTimers();
      if (loading) {
        if (visible) return;
        showTimer = setTimeout(() => {
          showTimer = null;
          if (!loading) return;
          visible = true; shownAt = performance.now(); onVisibilityChange(true);
        }, 300);
      } else if (visible) {
        const remaining = Math.max(0, 500 - (performance.now() - shownAt));
        if (remaining) hideTimer = setTimeout(hide, remaining);
        else hide();
      }
    },
    // Closing, changing videos or showing an error cancels obsolete loading UI.
    reset() {
      clearTimers(); loading = false;
      if (visible) { visible = false; onVisibilityChange(false); }
    },
  };
}
