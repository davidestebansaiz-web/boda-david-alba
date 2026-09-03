import { createGlobalStyle } from "styled-components";

import satisfyFontUrl from "../../assets/fonts/Satisfy/Satisfy-Regular.ttf?url";

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: "Satisfy";
    src: url(${satisfyFontUrl}) format("truetype");
    font-style: normal;
    font-weight: 400;
    font-display: swap;
  }

  :root {
    font-family: "Source Sans 3", "Trebuchet MS", "Gill Sans", sans-serif;
    line-height: 1.5;
    font-weight: 400;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #93b7f2
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-width: 320px;
    min-height: 100vh;
    color: #2f2620;
    overflow-x: hidden;
  }

  #root {
    min-height: 100vh;
  }

  button,
  input,
  textarea {
    font: inherit;
  }
`;
