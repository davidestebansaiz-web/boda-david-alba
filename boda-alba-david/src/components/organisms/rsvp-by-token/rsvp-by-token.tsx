import styled from "styled-components";

import { Button } from "../../atoms/button";
import { Card } from "../../atoms/card";
import {
  BodyText,
  ErrorText,
  Heading,
} from "../../atoms/text";
import { InviteeRsvpRow } from "../../molecules/invitee-rsvp-row";
import { TokenForm } from "../../molecules/token-form";
import { useRsvpByToken } from "./use-rsvp-by-token";

const FormContainer = styled.form`
  display: grid;
  gap: 0.9rem;
`;

const CardSubtitle = styled(BodyText)`
  margin-top: 0.55rem;
`;

const FormStack = styled.div`
  display: grid;
  gap: 0.9rem;
`;

const validationFallbackMessage = "Revisa los datos del formulario y vuelve a intentarlo.";

export function RsvpByToken() {
  const {
    view,
    errorMessage,
    tokenContext,
    tokenForm,
    inviteeForm,
    inviteeFields,
    isValidatingToken,
    isSubmittingInvitees,
    validateToken,
    submitInvitees,
    clearSuccess,
  } = useRsvpByToken();

  const tokenValidationError = tokenForm.formState.errors.token?.message;
  const inviteeValidationError =
    typeof inviteeForm.formState.errors.invitees?.message === "string"
      ? inviteeForm.formState.errors.invitees.message
      : null;

  if (view === "success") {
    return (
      <Card aria-live="polite">
        <Heading>Confirmacion enviada</Heading>
        <CardSubtitle>Gracias. Hemos guardado correctamente la asistencia de tu grupo.</CardSubtitle>
        <Button type="button" onClick={clearSuccess}>
          Registrar otro token
        </Button>
      </Card>
    );
  }

  if (view === "guest-form") {
    return (
      <Card>
        <Heading>Asistencia del grupo</Heading>
        <CardSubtitle>Token: {tokenContext?.token}</CardSubtitle>

        {errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}
        {inviteeValidationError ? <ErrorText>{inviteeValidationError}</ErrorText> : null}

        <FormContainer onSubmit={inviteeForm.handleSubmit(submitInvitees)}>
          <FormStack>
            {inviteeFields.map((inviteeField, index) => {
              const inviteeIdFieldName = `invitees.${index}.inviteeId` as const;
              const inviteeDisplayNameFieldName = `invitees.${index}.displayName` as const;
              const inviteeAttendingFieldName = `invitees.${index}.attending` as const;
              const inviteeNoteFieldName = `invitees.${index}.note` as const;
              const attending = inviteeForm.watch(inviteeAttendingFieldName);

              const noteError =
                typeof inviteeForm.formState.errors.invitees?.[index]?.note?.message === "string"
                  ? inviteeForm.formState.errors.invitees?.[index]?.note?.message
                  : null;

              return (
                <InviteeRsvpRow
                  key={inviteeField.id}
                  inviteeName={inviteeField.displayName}
                  noteInputId={`note-${inviteeField.id}`}
                  inviteeIdRegister={inviteeForm.register(inviteeIdFieldName)}
                  inviteeNameRegister={inviteeForm.register(inviteeDisplayNameFieldName)}
                  attendanceInputName={`attendance-${inviteeField.id}`}
                  attending={Boolean(attending)}
                  onAttendingChange={(nextAttending) => {
                    inviteeForm.setValue(inviteeAttendingFieldName, nextAttending, {
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                  }}
                  noteRegister={inviteeForm.register(inviteeNoteFieldName)}
                  disabled={isSubmittingInvitees}
                  noteErrorMessage={noteError}
                />
              );
            })}
          </FormStack>

          <Button type="submit" disabled={isSubmittingInvitees} $isLoading={isSubmittingInvitees}>
            {isSubmittingInvitees ? "Enviando..." : "Enviar confirmacion"}
          </Button>
        </FormContainer>
      </Card>
    );
  }

  return (
    <Card>
      <Heading>Confirma tu asistencia</Heading>
      <CardSubtitle>Escanea el QR o introduce el token manualmente para empezar.</CardSubtitle>

      {errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}
      {tokenValidationError ? <ErrorText>{tokenValidationError}</ErrorText> : null}

      <TokenForm
        onSubmit={tokenForm.handleSubmit(validateToken)}
        tokenRegister={tokenForm.register("token")}
        disabled={isValidatingToken}
        submitLabel={isValidatingToken ? "Validando..." : "Validar token"}
      />

      {tokenForm.formState.errors.root ? (
        <ErrorText>{tokenForm.formState.errors.root.message ?? validationFallbackMessage}</ErrorText>
      ) : null}
    </Card>
  );
}
