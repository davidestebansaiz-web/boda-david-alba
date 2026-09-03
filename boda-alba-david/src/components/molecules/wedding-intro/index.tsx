import { IntroSection, IntroSubtitle, IntroTitle } from "./styles";

export function WeddingIntro() {
  return (
    <IntroSection aria-labelledby="wedding-title">
      <IntroTitle id="wedding-title">Boda Alba y David</IntroTitle>
      <IntroSubtitle>
        ¡Nos casamos! y estamos deseando que lo podamos celebrar juntos
      </IntroSubtitle>
    </IntroSection>
  );
}
