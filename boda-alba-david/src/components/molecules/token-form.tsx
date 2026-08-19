import type { FormEventHandler } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import styled from "styled-components";

import { Button } from "../atoms/button";
import { Input } from "../atoms/input";
import { Label } from "../atoms/label";

const FormContainer = styled.form`
  display: grid;
  gap: 0.9rem;
`;

interface TokenFormProps {
  onSubmit: FormEventHandler<HTMLFormElement>;
  tokenRegister: UseFormRegisterReturn;
  disabled: boolean;
  submitLabel: string;
}

export function TokenForm({
  onSubmit,
  tokenRegister,
  disabled,
  submitLabel,
}: TokenFormProps) {
  return (
    <FormContainer onSubmit={onSubmit}>
      <Label htmlFor="token-input">Token de invitacion</Label>
      <Input
        id="token-input"
        type="text"
        autoComplete="off"
        placeholder="Ej: qr_alba_david_family_001"
        disabled={disabled}
        {...tokenRegister}
      />

      <Button type="submit" disabled={disabled} $isLoading={disabled}>
        {submitLabel}
      </Button>
    </FormContainer>
  );
}
