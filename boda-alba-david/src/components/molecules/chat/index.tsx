import styled from "styled-components";
const Container = styled.article<{ invert?: boolean }>`
    display: flex; 
    gap: 10px;
    padding: 20px;
    
`;

const Wrapper = styled.div<{ invert?: boolean }>`
    background: linear-gradient(130deg, rgba(255, 255, 255, 0.8), rgba(246, 234, 223, 0.8));
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 68px;
    flex-grow: 1;
    border-radius: 170px;
    border: solid 10px rgba(0, 0, 0, 0.2);
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
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
  font-size: 29px;
  ${props => props.invert ? `
    text-align: left;
  ` : `
    text-align: right;
  `}
`;

const Content = styled.div<{ invert?: boolean }>`
  grid-area: content;
  font-size: 18px;
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

            <Wrapper>
                <Title invert={invert}>{title}</Title>
                <Content invert={invert}>{children}</Content>
            </Wrapper>
        </Container>
    );
}
