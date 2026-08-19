import { z } from "zod";

export const tokenFormSchema = z.object({
  token: z
    .string()
    .trim()
    .min(1, "Introduce un token valido para continuar."),
});

export type TokenFormValues = z.infer<typeof tokenFormSchema>;

const inviteeRowSchema = z.object({
  inviteeId: z.string().trim().min(1),
  displayName: z.string().trim().min(1),
  attending: z.boolean(),
  note: z.string().max(1000, "La nota no puede superar los 1000 caracteres."),
});

export const inviteeFormSchema = z.object({
  invitees: z.array(inviteeRowSchema).min(1, "No hay invitados para confirmar."),
});

export type InviteeFormValues = z.infer<typeof inviteeFormSchema>;
