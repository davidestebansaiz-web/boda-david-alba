import styled from "styled-components";

export const InformationSection = styled.div`
  width: min(100% - 2.5rem, 960px);
  margin: 0 auto;
  padding: clamp(3.75rem, 8vw, 6.5rem) 0 clamp(4.5rem, 9vw, 7rem);
  color: #2f2620;
  gap: 60px;
  display: flex;
  flex-direction: column;
  margin-top: -288px;
  z-index: 2;
  position: relative;
`;

export const IntroSection = styled.section`
  max-width: 730px;
  margin: 0 auto;
  text-align: center;
`;

export const SectionEyebrow = styled.p`
  margin: 0 0 0.65rem;
  color: #9f563a;
  font-family: "Satisfy", cursive;
  font-size: clamp(1.45rem, 3vw, 2rem);
  line-height: 1;
`;

export const SectionHeading = styled.h2`
  margin: 0;
  color: #3e2922;
  font-family: "Fraunces", "Iowan Old Style", "Palatino Linotype", serif;
  font-size: clamp(2rem, 4vw, 3.15rem);
  font-weight: 500;
  line-height: 1.15;
`;

export const IntroCopy = styled.p`
  margin: 1.35rem auto 0;
  color: #6c594f;
  font-size: clamp(1rem, 1.6vw, 1.12rem);
  line-height: 1.8;
`;

export const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: clamp(2.5rem, 6vw, 4rem) 0 clamp(4rem, 9vw, 6rem);

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const DetailsCard = styled.article`
  padding: 1.5rem;
  background: linear-gradient(145deg, #fffdf9, #f8eee5);
  border: 1px solid #ead8c9;
  border-radius: 18px;
  box-shadow: 0 12px 28px rgba(75, 44, 29, 0.07);

  h3 {
    margin: 0 0 0.6rem;
    color: #57362b;
    font-family: "Fraunces", "Iowan Old Style", "Palatino Linotype", serif;
    font-size: 1.18rem;
    font-weight: 500;
  }

  p {
    margin: 0;
    color: #6c594f;
    font-size: 0.95rem;
    line-height: 1.65;
  }
`;

export const Timeline = styled.ol`
  position: relative;
  display: grid;
  gap: 0;
  margin: 2rem 0 0;
  padding: 0;
  list-style: none;

  &::before {
    position: absolute;
    top: 1.3rem;
    bottom: 1.3rem;
    left: 1.25rem;
    width: 1px;
    background: #d7a789;
    content: "";
  }
`;

export const TimelineItem = styled.li`
  position: relative;
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
  min-height: 5.5rem;
  padding: 0.85rem 1.25rem 0.85rem 0;

  &:last-child {
    border-bottom: 0;
  }

  p {
    margin: 0.25rem 0 0;
    color: #78655a;
    font-size: 0.95rem;
  }

  @media (max-width: 560px) {
    grid-template-columns: 2.3rem minmax(0, 1fr);
    gap: 0.75rem;

    p {
      font-size: 0.88rem;
    }
  }
`;

export const TimelineMarker = styled.span`
  z-index: 1;
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  color: #fff;
  background:  orange;
  border: 4px solid #fff;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
`;

export const TimelineLabel = styled.h3`
  margin: 0;
  color: #473029;
  font-family: "Fraunces", "Iowan Old Style", "Palatino Linotype", serif;
  font-size: 1.25rem;
  font-weight: 500;
`;

export const TimelineTime = styled.time`
  padding: 0.38rem 0.7rem;
  color: #81533f;
  background: #f8eee5;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;

  @media (max-width: 560px) {
    grid-column: 2;
    justify-self: start;
  }
`;

export const AttendanceSection = styled.section`
  margin-top: clamp(3.25rem, 8vw, 5.5rem);
  padding: clamp(2rem, 5vw, 3.5rem);
  color: #fff;
  background: linear-gradient(135deg, #3f75de, #5c85d8 55%, #7c9ce0);
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 18px 40px rgba(57, 96, 174, 0.24);

  ${SectionEyebrow} {
    color: #f8dfc9;
  }

  ${SectionHeading} {
    color: #fff;
  }

  p {
    max-width: 510px;
    margin: 1rem auto 0;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.65;
  }
`;

export const AttendanceButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  margin-top: 1.6rem;
  padding: 0.75rem 1.2rem;
  color: #3e578f;
  background: #fffaf3;
  border-radius: 999px;
  box-shadow: 0 8px 20px rgba(35, 63, 119, 0.2);
  font-weight: 700;
  text-decoration: none;
  transition: transform 160ms ease, box-shadow 160ms ease;

  &:hover {
    box-shadow: 0 11px 24px rgba(35, 63, 119, 0.28);
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 3px solid #f8dfc9;
    outline-offset: 3px;
  }
`;

export const MusicSection = styled.section`
  margin-top: clamp(3.5rem, 8vw, 5.5rem);
  text-align: center;

  > p {
    margin: 1rem auto 1.6rem;
    color: #6c594f;
  }
`;

export const SpotifyEmbed = styled.iframe`
  display: block;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  border: 0;
  border-radius: 12px;
  box-shadow: 0 14px 32px rgba(52, 34, 25, 0.14);
`;
