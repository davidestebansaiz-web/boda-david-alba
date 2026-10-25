import styled from "styled-components";

export const CharacterSceneSection = styled.section`
  position: relative;
  width: 200px;
  height: 200px;
  overflow: hidden;

  canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
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
