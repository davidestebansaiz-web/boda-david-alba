import type { ReactNode } from "react";
import styled from "styled-components";

const ChatContainer = styled.article`
  display: flex;
  gap: 10px;
  padding: 20px;
`;

const MessageBubble = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 68px;
  border: 10px solid rgba(0, 0, 0, 0.2);
  border-radius: 170px;
  background: linear-gradient(130deg, rgba(255, 255, 255, 0.8), rgba(246, 234, 223, 0.8));
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const AlignedContent = styled.div<{ $invert: boolean }>`
  text-align: ${({ $invert }) => ($invert ? "left" : "right")};
`;

const Avatar = styled(AlignedContent)``;

const Title = styled(AlignedContent)`
  font-size: 29px;
`;

const Content = styled(AlignedContent)`
  font-size: 18px;
`;

export type ChatProps = {
  title: string;
  children: ReactNode;
  avatar?: ReactNode;
  invert?: boolean;
};

export default function Chat({ title, children, avatar, invert = false }: ChatProps) {
  return (
    <ChatContainer>
      {avatar && <Avatar $invert={invert}>{avatar}</Avatar>}
      <MessageBubble>
        <Title $invert={invert}>{title}</Title>
        <Content $invert={invert}>{children}</Content>
      </MessageBubble>
    </ChatContainer>
  );
}
