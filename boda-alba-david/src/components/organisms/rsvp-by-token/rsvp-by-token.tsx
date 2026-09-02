import {
  GuestRsvpView,
  RsvpSuccessView,
  TokenEntryView,
} from "./rsvp-by-token.views";
import { useRsvpByToken } from "./use-rsvp-by-token";

export function RsvpByToken() {
  const controller = useRsvpByToken();

  switch (controller.view) {
    case "success":
      return <RsvpSuccessView onReset={controller.clearSuccess} />;
    case "guest-form":
      return <GuestRsvpView controller={controller} />;
    case "token":
      return <TokenEntryView controller={controller} />;
  }
}
