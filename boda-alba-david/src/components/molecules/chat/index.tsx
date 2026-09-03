import type { ReactNode } from "react";

import { Avatar, ChatContainer, Content, MessageBubble, Title } from "./styles";

export type ChatProps = {
  title: string;
  children: ReactNode;
  avatar?: ReactNode;
  invert?: boolean;
};

export default function Chat({ title, children, avatar, invert = false }: ChatProps) {
  return (
    <ChatContainer $invert={invert}>
      {avatar && <Avatar $invert={invert}>{avatar}</Avatar>}
      <MessageBubble>
        <Title $invert={invert}>{title}</Title>
        <Content $invert={invert}>{children}</Content>
      </MessageBubble>
    </ChatContainer>
  );
}
