import type { UseFormRegisterReturn } from "react-hook-form";

import { Radio } from "../../atoms/radio";
import { Textarea } from "../../atoms/textarea";
import { ErrorText } from "../../atoms/text";
import {
  AttendanceGroup,
  AttendanceLabel,
  InviteeLegend,
  InviteeRow,
  NoteLabel,
} from "./styles";

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
