import styled from "styled-components";

import Chat, { type ChatProps } from "../chat";

const ChatListContainer = styled.section`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
`;

export type ChatOption = ChatProps & {
  id: string;
};

type ChatListProps = {
  options: ChatOption[];
  className?: string;
};

export default function ChatList({ options, className }: ChatListProps) {
  return (
    <ChatListContainer className={className} aria-label="Conversaciones">
      {options.map(({ id, ...chatProps }) => <Chat key={id} {...chatProps} />)}
    </ChatListContainer>
  );
}
