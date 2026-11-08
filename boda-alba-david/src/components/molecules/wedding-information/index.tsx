import { WeddingChats } from "../../../components/organisms/wedding-chats";
import {
  AttendanceButton,
  AttendanceSection,
  InformationSection,
  IntroCopy,
  IntroSection,
  SectionEyebrow,
  SectionHeading,
  Timeline,
  TimelineItem,
  TimelineLabel,
  TimelineMarker,
  TimelineTime,
  MusicSection,
  SpotifyEmbed,
} from "./styles";

const WEDDING_SCHEDULE = [
  { title: "Recepción", detail: "Bienvenida y llegada de invitados" },
  { title: "Ceremonia", detail: "El momento de decir «sí, quiero»" },
  { title: "Cóctel", detail: "Brindis, música y algo rico para compartir" },
  { title: "Comida", detail: "Nos sentamos a celebrar alrededor de la mesa" },
  { title: "Fiesta", detail: "Baile, abrazos y muchas ganas de pasarlo bien" },
  { title: "Autobús", detail: "Vuelta con tranquilidad al final de la noche" },
];

export function WeddingInformation() {
  return (
    <InformationSection>
      <IntroSection aria-labelledby="welcome-title">
        <SectionEyebrow>Alba & David</SectionEyebrow>
        <SectionHeading id="welcome-title">Qué alegría compartir este día contigo</SectionHeading>
        <IntroCopy>
          Hemos imaginado esta celebración llena de risas, abrazos y momentos bonitos.
          Gracias por acompañarnos y por formar parte de un recuerdo que guardaremos para siempre.
          Solo tienes que venir con ganas de disfrutar: nosotros ponemos la música, los brindis y la ilusión.
        </IntroCopy>
      </IntroSection>
      <WeddingChats />
      <section aria-labelledby="schedule-title">
        <SectionEyebrow>El plan del día</SectionEyebrow>
        <SectionHeading id="schedule-title">Horarios</SectionHeading>
        <Timeline>
          {WEDDING_SCHEDULE.map((item) => (
            <TimelineItem key={item.title}>
              <TimelineMarker aria-hidden="true"></TimelineMarker>
              <div>
                <TimelineLabel>{item.title}</TimelineLabel>
                <p>{item.detail}</p>
              </div>
              <TimelineTime>Por confirmar</TimelineTime>
            </TimelineItem>
          ))}
        </Timeline>
      </section>
      <AttendanceSection aria-labelledby="attendance-title">
        <SectionEyebrow>Confirma tu asistencia</SectionEyebrow>
        <SectionHeading id="attendance-title">Nos encantará contar contigo</SectionHeading>
        <p>Cuéntanos si podrás venir y ayúdanos a preparar cada detalle para ti.</p>
        <AttendanceButton as="button" disabled type="button">
          Ir al formulario de asistencia
        </AttendanceButton>
      </AttendanceSection>

      <MusicSection aria-labelledby="music-title">
        <SectionEyebrow>La banda sonora</SectionEyebrow>
        <SectionHeading id="music-title">Las canciones de nuestra boda</SectionHeading>
        <p>Dale al play y empieza a calentar motores para la celebración.</p>
        <SpotifyEmbed
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          frameBorder="0"
          height="352"
          loading="lazy"
          src="https://open.spotify.com/embed/playlist/4nV31azfDqCx8EE4YHHMT4?utm_source=generator&si=91cf6bc756c04dc9"
          title="Playlist de la boda de Alba y David"
          width="100%"
        />
      </MusicSection>
    </InformationSection>
  );
}
