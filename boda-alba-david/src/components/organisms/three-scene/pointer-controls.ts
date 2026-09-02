import type { OrbitControls } from "three/addons/controls/OrbitControls.js";

type PointerControlsCleanup = () => void;

export function enableRightButtonPan(
  canvas: HTMLCanvasElement,
  controls: OrbitControls,
): PointerControlsCleanup {
  let isRightPanning = false;

  const handlePointerDown = (event: PointerEvent) => {
    if (event.button !== 2) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    isRightPanning = true;
    canvas.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!isRightPanning || (event.buttons & 2) === 0) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    controls.pan(event.movementX * controls.panSpeed, event.movementY * controls.panSpeed);
  };

  const handlePointerUp = (event: PointerEvent) => {
    if (!isRightPanning) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    isRightPanning = false;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  };

  const preventContextMenu = (event: MouseEvent) => event.preventDefault();

  canvas.addEventListener("pointerdown", handlePointerDown, true);
  canvas.addEventListener("pointermove", handlePointerMove, true);
  canvas.addEventListener("pointerup", handlePointerUp, true);
  canvas.addEventListener("pointercancel", handlePointerUp, true);
  canvas.addEventListener("contextmenu", preventContextMenu, true);

  return () => {
    canvas.removeEventListener("pointerdown", handlePointerDown, true);
    canvas.removeEventListener("pointermove", handlePointerMove, true);
    canvas.removeEventListener("pointerup", handlePointerUp, true);
    canvas.removeEventListener("pointercancel", handlePointerUp, true);
    canvas.removeEventListener("contextmenu", preventContextMenu, true);
  };
}
