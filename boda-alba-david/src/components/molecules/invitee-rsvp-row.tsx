import type { UseFormRegisterReturn } from "react-hook-form";
import styled from "styled-components";

import { Label } from "../atoms/label";
import { Radio } from "../atoms/radio";
import { Textarea } from "../atoms/textarea";
import { ErrorText } from "../atoms/text";

const InviteeRow = styled.fieldset`
  margin: 0;
  border: 1px solid #e4d2c1;
  border-radius: 14px;
  padding: 0.9rem;
  display: grid;
  gap: 0.55rem;
  background: #fff;
`;

const InviteeLegend = styled.legend`
  font-weight: 700;
  padding: 0 0.2rem;
`;

const AttendanceGroup = styled.div`
  display: grid;
  gap: 0.45rem;
`;

const AttendanceLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-weight: 600;
`;

const NoteLabel = styled(Label)`
  font-size: 0.9rem;
  color: #6c594f;
`;

interface InviteeRsvpRowProps {
  inviteeName: string;
  noteInputId: string;
  inviteeIdRegister: UseFormRegisterReturn;
  inviteeNameRegister: UseFormRegisterReturn;
  attendanceInputName: string;
  attending: boolean;
  onAttendingChange: (attending: boolean) => void;
  noteRegister: UseFormRegisterReturn;
  disabled: boolean;
  noteErrorMessage: string | null;
}

export function InviteeRsvpRow({
  inviteeName,
  noteInputId,
  inviteeIdRegister,
  inviteeNameRegister,
  attendanceInputName,
  attending,
  onAttendingChange,
  noteRegister,
  disabled,
  noteErrorMessage,
}: InviteeRsvpRowProps) {
  return (
    <InviteeRow>
      <InviteeLegend>{inviteeName}</InviteeLegend>

      <input type="hidden" {...inviteeIdRegister} />
      <input type="hidden" {...inviteeNameRegister} />

      <AttendanceGroup role="radiogroup" aria-label={`Asistencia de ${inviteeName}`}>
        <AttendanceLabel>
          <Radio
            type="radio"
            name={attendanceInputName}
            checked={attending}
            onChange={() => onAttendingChange(true)}
            disabled={disabled}
          />
          Asistiré
        </AttendanceLabel>

        <AttendanceLabel>
          <Radio
            type="radio"
            name={attendanceInputName}
            checked={!attending}
            onChange={() => onAttendingChange(false)}
            disabled={disabled}
          />
          No asistiré
        </AttendanceLabel>
      </AttendanceGroup>

      <NoteLabel htmlFor={noteInputId}>Nota opcional</NoteLabel>
      <Textarea id={noteInputId} rows={3} maxLength={1000} disabled={disabled} {...noteRegister} />

      {noteErrorMessage ? <ErrorText>{noteErrorMessage}</ErrorText> : null}
    </InviteeRow>
  );
}
