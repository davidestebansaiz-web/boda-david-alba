import styled from "styled-components";

import { Label } from "../../atoms/label";

export const InviteeRow = styled.fieldset`
  margin: 0;
  border: 1px solid #e4d2c1;
  border-radius: 14px;
  padding: 0.9rem;
  display: grid;
  gap: 0.55rem;
  background: #fff;
`;

export const InviteeLegend = styled.legend`
  font-weight: 700;
  padding: 0 0.2rem;
`;

export const AttendanceGroup = styled.div`
  display: grid;
  gap: 0.45rem;
`;

export const AttendanceLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-weight: 600;
`;

export const NoteLabel = styled(Label)`
  font-size: 0.9rem;
  color: #6c594f;
`;
