import styled from "styled-components";

interface ButtonProps {
  $isLoading?: boolean;
}

export const Button = styled.button<ButtonProps>`
  appearance: none;
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #bb5a37, #8f3d22);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(143, 61, 34, 0.22);
  }

  &:disabled {
    opacity: 0.6;
    cursor: ${({ $isLoading }) => ($isLoading ? "wait" : "not-allowed")};
  }
`;
