import styled from "styled-components";

import { Hero } from "./components/molecules/hero";
import { RsvpByToken } from "./components/organisms/rsvp-by-token/rsvp-by-token";
import { WeddingScene } from "./components/organisms/wedding-scene/wedding-scene";

const AppShell = styled.main`
  min-height: 100vh;
`;

const ExistingSections = styled.div`
  display: grid;
  grid-template-columns: minmax(280px, 760px);
  justify-content: center;
  gap: 1.5rem;
  padding: 2.5rem 1.25rem 3rem;

  @media (max-width: 640px) {
    padding: 1.15rem 0.9rem 2rem;
  }
`;

export default function App() {
  return (
    <AppShell>
      <WeddingScene />
      <ExistingSections>
        <Hero />
        <RsvpByToken />
      </ExistingSections>
    </AppShell>
  );
}
