import styled from "styled-components";
import Chat from "../chat";

const Container = styled.article<{ invert?: boolean }>`
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
`;

export default function ChatList({ options, className }: { options: { title: string; children: React.ReactNode, avatar?: React.ReactNode, invert?: boolean }[], className?: string }) {
    return (
        <Container className={className}>
            {options.map((option, index) => (
                <Chat key={index} title={option.title} avatar={option.avatar} invert={option.invert}>
                    {option.children}
                </Chat>
            ))}
        </Container>
    );
}
