export const SCROLL_OFFSET_RATIO = 0.1

/** Scrolls to the element leaving ~10% of the viewport as space above it. */
export function scrollToElement(
  selector: string,
  offsetRatio = SCROLL_OFFSET_RATIO,
): void {
  const element = document.querySelector(selector)
  if (!element || typeof window.scrollTo !== 'function') {
    return
  }

  const top = element.getBoundingClientRect().top + window.scrollY
  const offset = window.innerHeight * offsetRatio
  window.scrollTo({ top: Math.max(top - offset, 0), behavior: 'smooth' })
}
