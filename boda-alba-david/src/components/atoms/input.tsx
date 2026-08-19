import styled from "styled-components";

export const Input = styled.input`
  width: 100%;
  border: 1px solid #e4d2c1;
  border-radius: 10px;
  padding: 0.65rem 0.8rem;
  background: #fff;
  color: #2f2620;
  font: inherit;
  box-sizing: border-box;

  &:focus {
    outline: 2px solid rgba(187, 90, 55, 0.28);
    border-color: #bb5a37;
  }
`;
