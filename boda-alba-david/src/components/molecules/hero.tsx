import styled from "styled-components";

import { BodyText, Eyebrow } from "../atoms/text";

const HeroContainer = styled.header`
  color: #2f2620;
  background: linear-gradient(130deg, rgba(255, 255, 255, 0.8), rgba(246, 234, 223, 0.8));
  border: 1px solid rgba(228, 210, 193, 0.8);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 12px 35px rgba(53, 31, 19, 0.09);
`;

const HeroTitle = styled.h1`
  margin: 0.2rem 0 0.6rem;
  font-family: "Fraunces", "Iowan Old Style", "Palatino Linotype", serif;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
`;

export function Hero() {
  return (
    <HeroContainer>
      <Eyebrow>Boda Alba & David</Eyebrow>
      <HeroTitle>RSVP por token</HeroTitle>
      <BodyText>
        Indica rapidamente la asistencia de cada invitado asociado a tu invitacion usando el token del QR
        o escribiendolo manualmente.
      </BodyText>
    </HeroContainer>
  );
}
