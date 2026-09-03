import { Button } from "../../atoms/button";
import { Card } from "../../atoms/card";
import { ErrorText, Heading } from "../../atoms/text";
import { InviteeRsvpRow } from "../../molecules/invitee-rsvp-row";
import { TokenForm } from "../../molecules/token-form";
import { CardSubtitle, FormContainer, FormStack } from "./styles";
import type { UseRsvpByTokenResult } from "./use-rsvp-by-token";

const VALIDATION_FALLBACK = "Revisa los datos del formulario y vuelve a intentarlo.";

type RsvpController = UseRsvpByTokenResult;

export function RsvpSuccessView({ onReset }: { onReset: () => void }) {
  return (
    <Card aria-live="polite">
      <Heading>Confirmacion enviada</Heading>
      <CardSubtitle>Gracias. Hemos guardado correctamente la asistencia de tu grupo.</CardSubtitle>
      <Button type="button" onClick={onReset}>Registrar otro token</Button>
    </Card>
  );
}

export function TokenEntryView({ controller }: { controller: RsvpController }) {
  const validationError = controller.tokenForm.formState.errors.token?.message;
  const rootError = controller.tokenForm.formState.errors.root?.message;

  return (
    <Card>
      <Heading>Confirma tu asistencia</Heading>
      <CardSubtitle>Escanea el QR o introduce el token manualmente para empezar.</CardSubtitle>
      {controller.errorMessage && <ErrorText>{controller.errorMessage}</ErrorText>}
      {validationError && <ErrorText>{validationError}</ErrorText>}
      <TokenForm
        onSubmit={controller.tokenForm.handleSubmit(controller.validateToken)}
        tokenRegister={controller.tokenForm.register("token")}
        disabled={controller.isValidatingToken}
        submitLabel={controller.isValidatingToken ? "Validando..." : "Validar token"}
      />
      {controller.tokenForm.formState.errors.root && (
        <ErrorText>{rootError ?? VALIDATION_FALLBACK}</ErrorText>
      )}
    </Card>
  );
}

function InviteeFields({ controller }: { controller: RsvpController }) {
  return controller.inviteeFields.map((field, index) => {
    const attendingField = `invitees.${index}.attending` as const;
    const noteError = controller.inviteeForm.formState.errors.invitees?.[index]?.note?.message;

    return (
      <InviteeRsvpRow
        key={field.id}
        inviteeName={field.displayName}
        noteInputId={`note-${field.id}`}
        inviteeIdRegister={controller.inviteeForm.register(`invitees.${index}.inviteeId`)}
        inviteeNameRegister={controller.inviteeForm.register(`invitees.${index}.displayName`)}
        attendanceInputName={`attendance-${field.id}`}
        attending={Boolean(controller.inviteeForm.watch(attendingField))}
        onAttendingChange={(attending) => controller.inviteeForm.setValue(attendingField, attending, {
          shouldDirty: true,
          shouldTouch: true,
        })}
        noteRegister={controller.inviteeForm.register(`invitees.${index}.note`)}
        disabled={controller.isSubmittingInvitees}
        noteErrorMessage={typeof noteError === "string" ? noteError : null}
      />
    );
  });
}

export function GuestRsvpView({ controller }: { controller: RsvpController }) {
  const inviteeError = controller.inviteeForm.formState.errors.invitees?.message;

  return (
    <Card>
      <Heading>Asistencia del grupo</Heading>
      <CardSubtitle>Token: {controller.tokenContext?.token}</CardSubtitle>
      {controller.errorMessage && <ErrorText>{controller.errorMessage}</ErrorText>}
      {typeof inviteeError === "string" && <ErrorText>{inviteeError}</ErrorText>}
      <FormContainer onSubmit={controller.inviteeForm.handleSubmit(controller.submitInvitees)}>
        <FormStack><InviteeFields controller={controller} /></FormStack>
        <Button
          type="submit"
          disabled={controller.isSubmittingInvitees}
          $isLoading={controller.isSubmittingInvitees}
        >
          {controller.isSubmittingInvitees ? "Enviando..." : "Enviar confirmacion"}
        </Button>
      </FormContainer>
    </Card>
  );
}
