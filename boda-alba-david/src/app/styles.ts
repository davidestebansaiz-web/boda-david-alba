import styled from "styled-components";

import ChatList from "../components/molecules/chat-list";

export const AppShell = styled.main`
  min-height: 100vh;
`;

export const ExistingSections = styled.div`
  display: grid;
  grid-template-columns: minmax(280px, 760px);
  justify-content: center;
  gap: 1.5rem;
  padding: 2.5rem 1.25rem 3rem;

  @media (max-width: 640px) {
    padding: 1.15rem 0.9rem 2rem;
  }
`;

export const ChatListStyled = styled(ChatList)`
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
`;
