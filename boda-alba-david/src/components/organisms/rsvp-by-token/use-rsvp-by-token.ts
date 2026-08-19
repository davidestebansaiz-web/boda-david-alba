import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";

import {
  fetchPublicInvitationContext,
  submitPublicRsvp,
} from "../../../services/rsvp-api-service";
import type {
  PublicInvitationContext,
  SubmitInviteeResponseInput,
} from "../../../services/rsvp-types";
import { useInitialTokenFromUrl } from "../../../uses/use-initial-token-from-url";
import { useSuccessQueryFlag } from "../../../uses/use-success-query-flag";
import {
  inviteeFormSchema,
  tokenFormSchema,
  type InviteeFormValues,
  type TokenFormValues,
} from "./rsvp-by-token.schemas";

export type RsvpByTokenView = "token" | "guest-form" | "success";

interface SubmitInviteesMutationInput {
  token: string;
  invitees: SubmitInviteeResponseInput[];
}

interface UseRsvpByTokenResult {
  view: RsvpByTokenView;
  errorMessage: string | null;
  tokenContext: PublicInvitationContext | null;
  tokenForm: ReturnType<typeof useForm<TokenFormValues>>;
  inviteeForm: ReturnType<typeof useForm<InviteeFormValues>>;
  inviteeFields: ReturnType<typeof useFieldArray<InviteeFormValues, "invitees">>["fields"];
  isValidatingToken: boolean;
  isSubmittingInvitees: boolean;
  validateToken: (values: TokenFormValues) => Promise<void>;
  submitInvitees: (values: InviteeFormValues) => Promise<void>;
  clearSuccess: () => void;
}

const isErrorWithMessage = (error: unknown): error is Error =>
  typeof error === "object" && error !== null && "message" in error;

const mapContextToInviteeFormValues = (context: PublicInvitationContext): InviteeFormValues => {
  const responsesById = new Map(context.currentResponses.map((response) => [response.inviteeId, response]));

  return {
    invitees: context.invitees.map((invitee) => {
      const response = responsesById.get(invitee.id);

      return {
        inviteeId: invitee.id,
        displayName: invitee.displayName,
        attending: response?.attending ?? false,
        note: response?.note ?? "",
      };
    }),
  };
};

const mapInviteeFormToPayload = (values: InviteeFormValues): SubmitInviteeResponseInput[] =>
  values.invitees.map((invitee) => {
    const note = invitee.note.trim();

    return {
      inviteeId: invitee.inviteeId,
      attending: invitee.attending,
      note: note.length > 0 ? note : null,
    };
  });

export const useRsvpByToken = (): UseRsvpByTokenResult => {
  const initialToken = useInitialTokenFromUrl();
  const { initialSuccess, updateSuccessFlag } = useSuccessQueryFlag();

  const [view, setView] = useState<RsvpByTokenView>(initialSuccess ? "success" : "token");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tokenContext, setTokenContext] = useState<PublicInvitationContext | null>(null);

  const tokenForm = useForm<TokenFormValues>({
    resolver: zodResolver(tokenFormSchema),
    defaultValues: {
      token: initialToken,
    },
    mode: "onSubmit",
  });

  const inviteeForm = useForm<InviteeFormValues>({
    resolver: zodResolver(inviteeFormSchema),
    defaultValues: {
      invitees: [],
    },
    mode: "onSubmit",
  });

  const inviteeFieldArray = useFieldArray({
    control: inviteeForm.control,
    name: "invitees",
  });

  const validateTokenMutation = useMutation({
    mutationFn: fetchPublicInvitationContext,
  });

  const submitInviteesMutation = useMutation({
    mutationFn: async ({ token, invitees }: SubmitInviteesMutationInput) =>
      submitPublicRsvp(token, invitees),
  });

  const validateToken = useCallback(async (values: TokenFormValues): Promise<void> => {
    setErrorMessage(null);

    try {
      const context = await validateTokenMutation.mutateAsync(values.token.trim());
      setTokenContext(context);
      tokenForm.setValue("token", context.token, { shouldDirty: false });
      inviteeForm.reset(mapContextToInviteeFormValues(context));
      setView("guest-form");
    } catch (error: unknown) {
      const message = isErrorWithMessage(error) ? error.message : "No se pudo validar el token.";
      setErrorMessage(message);
      setView("token");
    }
  }, [inviteeForm, tokenForm, validateTokenMutation]);

  const submitInvitees = async (values: InviteeFormValues): Promise<void> => {
    if (!tokenContext) {
      setErrorMessage("No hay un token validado para enviar la confirmacion.");
      setView("token");
      return;
    }

    setErrorMessage(null);

    try {
      await submitInviteesMutation.mutateAsync({
        token: tokenContext.token,
        invitees: mapInviteeFormToPayload(values),
      });

      updateSuccessFlag(true);
      setView("success");
    } catch (error: unknown) {
      const message = isErrorWithMessage(error) ? error.message : "No se pudo enviar la confirmacion.";
      setErrorMessage(message);
      setView("guest-form");
    }
  };

  const clearSuccess = (): void => {
    updateSuccessFlag(false);
    setView("token");
    setErrorMessage(null);
    setTokenContext(null);
    inviteeForm.reset({ invitees: [] });
  };

  useEffect(() => {
    const token = initialToken.trim();

    if (token.length === 0 || initialSuccess || view !== "token") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void validateToken({ token });
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [initialSuccess, initialToken, validateToken, view]);

  return {
    view,
    errorMessage,
    tokenContext,
    tokenForm,
    inviteeForm,
    inviteeFields: inviteeFieldArray.fields,
    isValidatingToken: validateTokenMutation.isPending,
    isSubmittingInvitees: submitInviteesMutation.isPending,
    validateToken,
    submitInvitees,
    clearSuccess,
  };
};
