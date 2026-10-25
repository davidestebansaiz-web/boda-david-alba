import styled from "styled-components";

export const ChatContainer = styled.article<{ $invert: boolean }>`
  display: flex;
  flex-direction: ${({ $invert }) => ($invert ? "row-reverse" : "row")};
  gap: 10px;
  padding: 20px;
`;

export const MessageBubble = styled.div<{ $invert: boolean }>`
  position: relative;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: orange;
  color: white;
  &:after {
    content: "";
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 19px;
  border-color: ${({ $invert }) => $invert ? "transparent transparent transparent orange" : "transparent orange transparent transparent"};
  ${({ $invert }) => $invert ? "right: -32px;" : "left: -32px;"};
  top: 24px;
}
  }
`;

const AlignedContent = styled.div<{ $invert: boolean }>`
  text-align: ${({ $invert }) => ($invert ? "right" : "left")};
`;

export const Avatar = styled(AlignedContent)``;

export const Title = styled(AlignedContent)`
  font-size: 29px;
`;

export const Content = styled(AlignedContent)`
  font-size: 18px;
`;
