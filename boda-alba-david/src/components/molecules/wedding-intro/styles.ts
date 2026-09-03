import styled from "styled-components";

export const IntroSection = styled.header`
position: absolute;
  z-index: 1;
  width: min(100%, 960px);
  margin: 0 auto;
  padding: clamp(3rem, 7vw, 5.5rem) clamp(1.25rem, 4vw, 2.5rem)
    clamp(2.5rem, 5vw, 4rem);
  text-align: center;
`;

export const IntroTitle = styled.h1`
  margin: 0;
  color: white;
  font-family: "Satisfy", cursive;
  font-size: clamp(3.25rem, 8vw, 6rem);
  font-weight: 400;
  line-height: 1.05;
`;

export const IntroSubtitle = styled.p`
  max-width: 720px;
  margin: clamp(1rem, 2vw, 1.5rem) auto 0;
  color: white;
  font-size: clamp(1.05rem, 2.2vw, 1.4rem);
  line-height: 1.6;
`;
