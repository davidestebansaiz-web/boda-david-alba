import styled from "styled-components";

export const SceneSection = styled.section`
  position: relative;
  width: 100%;
  min-height: 70vh;
  min-height: 70svh;
  overflow: hidden;
  canvas {
    display: block;
    width: 100% !important;
    min-height: 130vh;
    cursor: grab;
    touch-action: pan-y;
  }

  canvas:active { cursor: grabbing; }
`;

export const LoadingMessage = styled.p<{ $isLoaded: boolean }>`
  position: absolute;
  inset: 50% auto auto 50%;
  z-index: 1;
  margin: 0;
  color: #604b3c;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transform: translate(-50%, -50%);
  opacity: ${({ $isLoaded }) => ($isLoaded ? 0 : 1)};
  transition: opacity 300ms ease;
  pointer-events: none;
`;

export const InteractionHint = styled.p`
  position: absolute;
  right: 1rem;
  bottom: 0.8rem;
  z-index: 1;
  margin: 0;
  padding: 0.4rem 0.65rem;
  color: rgba(47, 38, 32, 0.72);
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.65);
  border-radius: 999px;
  font-size: 0.72rem;
  backdrop-filter: blur(8px);
  pointer-events: none;
`;

export const GuiContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
  max-height: calc(100% - 2rem);
  box-shadow: 0 8px 24px rgba(73, 47, 31, 0.12);
  overflow-y: auto;

  .lil-gui.root {
    --background-color: rgba(35, 30, 27, 0.92);
    --widget-color: #4a413c;
    --hover-color: #5d514a;
    --focus-color: #75645a;
    --text-color: #fff8f1;
    --number-color: #e8bd9f;
    --string-color: #cddfae;
  }

  @media (max-width: 640px) {
    top: 0.75rem;
    right: 0.75rem;
  }
`;
