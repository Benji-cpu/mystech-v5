import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type Props = {
  name?: string | null;
  streakCount: number;
  hasChronicle: boolean;
  /** Yesterday's forged card (chronicle users) or a card from the user's decks. */
  card: { title: string; imageUrl: string | null } | null;
  ctaUrl: string;
  appUrl: string;
};

export function DailyCardEmail({
  name,
  streakCount,
  hasChronicle,
  card,
  ctaUrl,
  appUrl,
}: Props) {
  const greeting = name ? `Good morning, ${name}` : "Good morning";
  const invitation = hasChronicle
    ? streakCount > 0
      ? `You're on a ${streakCount}-day streak. Today's card is waiting to be forged.`
      : "Today's card is waiting to be forged from whatever the day holds."
    : "A few quiet minutes with the cards to begin the day.";

  return (
    <Html>
      <Head />
      <Preview>
        {streakCount > 0
          ? `Day ${streakCount} and counting — your card awaits.`
          : "Your card awaits."}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={brand}>
            <Text style={brandMark}>✦ MysTech</Text>
            <Text style={dateline}>
              {streakCount > 0 ? `${streakCount}-day streak` : "Daily practice"}
            </Text>
          </Section>

          <Heading style={heading}>{greeting}</Heading>
          <Text style={paragraph}>{invitation}</Text>

          {card?.imageUrl ? (
            <Section style={cardWrap}>
              <Img
                src={card.imageUrl}
                alt={card.title}
                width="280"
                height="420"
                style={cardImage}
              />
              {hasChronicle && (
                <Text style={cardCaption}>
                  Yesterday you forged &ldquo;{card.title}&rdquo;
                </Text>
              )}
            </Section>
          ) : null}

          <Section style={ctaWrap}>
            <Link href={ctaUrl} style={cta}>
              Begin today&rsquo;s ritual
            </Link>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            You&rsquo;re receiving this daily reminder by choice.{" "}
            <Link href={`${appUrl}/settings/daily-card`} style={footerLink}>
              Manage
            </Link>
            {" · "}
            <Link href={appUrl} style={footerLink}>
              mystech.app
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default DailyCardEmail;

const body = {
  backgroundColor: "#0a0614",
  fontFamily: "Georgia, 'Times New Roman', serif",
  color: "#e6e1d9",
  margin: 0,
  padding: "40px 20px",
};

const container = {
  maxWidth: "560px",
  margin: "0 auto",
  backgroundColor: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "14px",
  padding: "36px 30px",
};

const brand = { textAlign: "center" as const, marginBottom: "24px" };
const brandMark = {
  color: "#d4a853",
  fontSize: "18px",
  letterSpacing: "0.25em",
  textTransform: "uppercase" as const,
  margin: 0,
};
const dateline = {
  color: "rgba(230,225,217,0.45)",
  fontSize: "12px",
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
  margin: "8px 0 0",
};

const heading = {
  color: "#ffffff",
  fontSize: "26px",
  fontWeight: 500,
  textAlign: "center" as const,
  margin: "0 0 14px",
};

const paragraph = {
  color: "rgba(230,225,217,0.85)",
  fontSize: "15px",
  lineHeight: 1.7,
  textAlign: "center" as const,
  margin: "0 0 22px",
};

const cardWrap = {
  textAlign: "center" as const,
  margin: "8px 0 24px",
};

const cardImage = {
  borderRadius: "10px",
  border: "1px solid rgba(212,168,83,0.35)",
  boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
  margin: "0 auto",
  display: "block" as const,
  maxWidth: "280px",
  height: "auto",
};

const cardCaption = {
  color: "rgba(230,225,217,0.55)",
  fontSize: "13px",
  fontStyle: "italic" as const,
  textAlign: "center" as const,
  margin: "12px 0 0",
};

const ctaWrap = { textAlign: "center" as const, margin: "30px 0 12px" };
const cta = {
  backgroundColor: "#d4a853",
  color: "#0a0614",
  padding: "14px 28px",
  borderRadius: "999px",
  fontWeight: 600,
  textDecoration: "none",
  display: "inline-block",
  letterSpacing: "0.02em",
};

const hr = {
  border: "none",
  borderTop: "1px solid rgba(255,255,255,0.1)",
  margin: "28px 0 16px",
};

const footer = {
  color: "rgba(230,225,217,0.45)",
  fontSize: "12px",
  textAlign: "center" as const,
  marginTop: "12px",
};

const footerLink = { color: "#d4a853", textDecoration: "none" };
