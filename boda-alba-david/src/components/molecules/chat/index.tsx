import styled from "styled-components";
const Container = styled.article<{ invert?: boolean }>`
    background: linear-gradient(130deg, rgba(255, 255, 255, 0.8), rgba(246, 234, 223, 0.8));
    display: grid;
    grid-template-columns: ${props => props.invert ? "auto 1fr" : "1fr auto"};
    gap: 10px;
    padding: 20px;
    grid-template-areas: ${props => props.invert ? `
        "avatar title"
        "avatar content"
    ` : `
        "title avatar"
        "content avatar"
    `};
`;

const Avatar = styled.div<{ invert?: boolean }>`
  grid-area: avatar;
  ${props => props.invert ? `
    text-align: left;
  ` : `
    text-align: right;
  `}
`;

const Title = styled.div<{ invert?: boolean }>`
  grid-area: title;
  ${props => props.invert ? `
    text-align: left;
  ` : `
    text-align: right;
  `}
`;

const Content = styled.div<{ invert?: boolean }>`
  grid-area: content;
  ${props => props.invert ? `
    text-align: left;
  ` : `
    text-align: right;
  `}
`;

export default function Chat({ title, children, avatar, invert }: { title: string; children: React.ReactNode, avatar?: React.ReactNode, invert?: boolean }) {
    return (
        <Container invert={invert}>
            <Avatar invert={invert}>{avatar}</Avatar>
            <Title invert={invert}>{title}</Title>
            <Content invert={invert}>{children}</Content>
        </Container>
    );
}
