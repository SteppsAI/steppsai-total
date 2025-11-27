import * as React from "react";



export function useSwipeToOpen(onOpen: () => void, threshold = 50) {
  React.useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwipe = false;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
      isSwipe = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwipe) {
        const diff = Math.abs(e.changedTouches[0].screenX - touchStartX);
        if (diff > 10) {
          isSwipe = true;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;

      if (isSwipe && touchStartX < 20) {
        const swipeDistance = touchEndX - touchStartX;
        if (swipeDistance > threshold) {
          onOpen();
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onOpen, threshold]);
}

export function useSwipeToClose(onClose: () => void, threshold = 50) {
  React.useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwipe = false;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
      isSwipe = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwipe) {
        const diff = Math.abs(e.changedTouches[0].screenX - touchStartX);
        if (diff > 10) {
          isSwipe = true;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;

      if (isSwipe) {
        const swipeDistance = touchStartX - touchEndX;
        if (swipeDistance > threshold) {
          onClose();
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onClose, threshold]);
}