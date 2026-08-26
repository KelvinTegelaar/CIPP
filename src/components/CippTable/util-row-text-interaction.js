export const hasTextSelection = () => {
  const sel = window.getSelection?.()
  return Boolean(sel?.type === 'Range' && sel.toString().trim())
}

export const isPointerDrag = (start, event, threshold = 4) => {
  if (!start || !event) {
    return false
  }
  return Math.hypot(event.clientX - start.x, event.clientY - start.y) > threshold
}

export const isRowTextInteraction = (start, event) =>
  hasTextSelection() || isPointerDrag(start, event)
