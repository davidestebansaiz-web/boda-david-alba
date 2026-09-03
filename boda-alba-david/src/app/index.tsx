import { Hero } from "../components/molecules/hero";
import { WeddingIntro } from "../components/molecules/wedding-intro";
import { RsvpByToken } from "../components/organisms/rsvp-by-token";
import { WeddingChats } from "../components/organisms/wedding-chats";
import { WeddingScene } from "../components/organisms/wedding-scene";
import { AppShell, ExistingSections } from "./styles";

// Sustituir por el valor del endpoint cuando esté disponible.
const numberOfGuests = 12;

export default function App() {
  return (
    <AppShell>
      <WeddingIntro />
      <WeddingScene numberOfGuests={numberOfGuests} />
      <WeddingChats />
      <ExistingSections>
        <Hero />
        <RsvpByToken />
      </ExistingSections>
    </AppShell>
  );
}
