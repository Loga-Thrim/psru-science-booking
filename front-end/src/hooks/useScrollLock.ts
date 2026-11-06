import { useEffect } from "react";

/**
 * Freezes the page behind an open modal.
 *
 * Counted rather than a plain on/off flag: the approval screen can have a
 * detail modal open with a confirm dialog on top of it, and the first one to
 * close must not unfreeze the page while the second is still up.
 */
let lockCount = 0;
let savedScrollY = 0;
let savedBody = "";

function lock() {
  lockCount += 1;
  if (lockCount > 1) return;

  const body = document.body;
  savedScrollY = window.scrollY;
  savedBody = body.style.cssText;

  // Hiding the scrollbar makes the page narrower, which shifts the layout
  // sideways as the modal opens. Pad by exactly the width it occupied.
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

  // `position: fixed` rather than just `overflow: hidden`, because iOS Safari
  // happily scrolls the body behind an overflow-hidden element on touch.
  body.style.position = "fixed";
  body.style.top = `-${savedScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";
  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`;
  }
}

function unlock() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;

  document.body.style.cssText = savedBody;
  // Pinning the body to `top: -Npx` loses the scroll position, so put it back.
  window.scrollTo(0, savedScrollY);
}

/**
 * @param active pass the modal's own visibility so the lock follows it. When a
 *        component only renders while open, leave it at the default.
 */
export function useScrollLock(active: boolean = true) {
  useEffect(() => {
    if (!active) return;
    lock();
    return unlock;
  }, [active]);
}

export default useScrollLock;
