import { WeddingIntro } from "../components/molecules/wedding-intro";
import { WeddingInformation } from "../components/molecules/wedding-information";
// import { Hero } from "../components/molecules/hero";
// import { RsvpByToken } from "../components/organisms/rsvp-by-token";
import { WeddingScene } from "../components/organisms/wedding-scene";
import { AppShell } from "./styles";
// import { ExistingSections } from "./styles";

// Sustituir por el valor del endpoint cuando esté disponible.
const numberOfGuests = 12;

export default function App() {
  return (
    <AppShell>
      <WeddingIntro />
      <WeddingScene numberOfGuests={numberOfGuests} />
      <WeddingInformation />
      {/* El anterior flujo de asistencia por token queda desactivado temporalmente.
      <ExistingSections>
        <Hero />
        <RsvpByToken />
      </ExistingSections> */}
    </AppShell>
  );
}
