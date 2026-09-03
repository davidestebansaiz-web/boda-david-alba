import styled from "styled-components";

import { Hero } from "./components/molecules/hero";
import { RsvpByToken } from "./components/organisms/rsvp-by-token/rsvp-by-token";
import { WeddingScene } from "./components/organisms/wedding-scene/wedding-scene";
import { Character } from "./components/organisms/character/character-scene";
import ChatList, { type ChatOption } from "./components/molecules/chat-list";

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

const ChatListStyled = styled(ChatList)`
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 100%;
`;

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
      <WeddingScene numberOfGuests={numberOfGuests} />
      <ChatListStyled options={conversations} />
      <ExistingSections>
        <Hero />
        <RsvpByToken />
      </ExistingSections>
    </AppShell>
  );
}
