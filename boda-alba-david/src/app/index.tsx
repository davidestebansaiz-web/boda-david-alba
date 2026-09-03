import { Hero } from "../components/molecules/hero";
import { type ChatOption } from "../components/molecules/chat-list";
import { WeddingIntro } from "../components/molecules/wedding-intro";
import { Character } from "../components/organisms/character";
import { RsvpByToken } from "../components/organisms/rsvp-by-token";
import { WeddingScene } from "../components/organisms/wedding-scene";
import { AppShell, ChatListStyled, ExistingSections } from "./styles";

const conversations: ChatOption[] = [
  {
    id: "welcome",
    title: "Chat 1",
    children: <p>Content for Chat 1</p>,
    avatar: <Character />,
    invert: true,
  },
];

// Sustituir por el valor del endpoint cuando esté disponible.
const numberOfGuests = 12;

export default function App() {
  return (
    <AppShell>
      <WeddingIntro />
      <WeddingScene numberOfGuests={numberOfGuests} />
      <ChatListStyled options={conversations} />
      <ExistingSections>
        <Hero />
        <RsvpByToken />
      </ExistingSections>
    </AppShell>
  );
}
