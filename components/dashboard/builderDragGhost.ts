export function createDragGhost(event: React.DragEvent<HTMLElement>, label: string) {
  const ghost = document.createElement("div");
  ghost.className = "builder-drag-ghost";

  const icon = document.createElement("span");
  icon.className = "builder-drag-ghost-icon";
  icon.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>`;
  ghost.appendChild(icon);

  const text = document.createElement("span");
  text.className = "builder-drag-ghost-label";
  text.textContent = label;
  ghost.appendChild(text);

  const hint = document.createElement("span");
  hint.className = "builder-drag-ghost-hint";
  hint.textContent = "Drag to position";
  ghost.appendChild(hint);

  document.body.appendChild(ghost);
  event.dataTransfer.setDragImage(ghost, 16, 16);
  requestAnimationFrame(() => {
    document.body.removeChild(ghost);
  });
}
