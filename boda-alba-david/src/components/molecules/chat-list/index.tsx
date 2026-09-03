import Chat, { type ChatProps } from "../chat";
import { ChatListContainer } from "./styles";

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
