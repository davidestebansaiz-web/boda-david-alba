import { type ChatOption } from "../../molecules/chat-list";
import { Character } from "../character";
import { ChatListStyled, WeddingChatsSection } from "./styles";

const currentConversations: ChatOption[] = [
  {
    id: "welcome",
    title: "Chat 1",
    children: <p>Content for Chat 1</p>,
    avatar: <Character facing="right" />,
  },
];

const invertedConversations: ChatOption[] = [
  {
    id: "welcome-inverted",
    title: "Chat 2",
    children: <p>Content for Chat 2</p>,
    avatar: <Character facing="left" model="personaje2" />,
    invert: true,
  },
];

export function WeddingChats() {
  return (
    <WeddingChatsSection aria-label="Mensajes de la boda">
      <ChatListStyled options={currentConversations} />
      <ChatListStyled options={invertedConversations} />
    </WeddingChatsSection>
  );
}
