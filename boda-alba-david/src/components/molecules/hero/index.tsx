import { useQuery } from "@tanstack/react-query";

import { BodyText, Eyebrow } from "../../atoms/text";
import { fetchAcceptedInvitationsCount } from "../../../services/rsvp-api-service";
import { HeroContainer, HeroTitle } from "./styles";

export function Hero() {
  const acceptedInvitationsQuery = useQuery({
    queryKey: ["accepted-invitations-count"],
    queryFn: fetchAcceptedInvitationsCount,
  });
  const acceptedInvitations = acceptedInvitationsQuery.data?.count;
  const title =
    acceptedInvitations === undefined
      ? "RSVP por token"
      : `RSVP por token · ${acceptedInvitations} ${acceptedInvitations === 1 ? "invitación aceptada" : "invitaciones aceptadas"}`;

  return (
    <HeroContainer>
      <Eyebrow>Boda Alba & David</Eyebrow>
      <HeroTitle>{title}</HeroTitle>
      <BodyText>
        Indica rapidamente la asistencia de cada invitado asociado a tu invitacion usando el token del QR
        o escribiendolo manualmente.
      </BodyText>
    </HeroContainer>
  );
}
