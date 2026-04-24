import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";

type Props = {
  name?: string | null;
  appUrl: string;
};

export function WelcomeEmail({ name, appUrl }: Props) {
  const greeting = name ? `Welcome, ${name}` : "Welcome";

  return (
    <Html>
      <Head />
      <Preview>Your oracle awaits — 3 readings ready for you today</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={brand}>
            <Text style={brandMark}>✦ MysTech</Text>
          </Section>

          <Heading style={heading}>{greeting}</Heading>
          <Text style={paragraph}>
            You&rsquo;ve just stepped through the gate. The cards are listening.
          </Text>
          <Text style={paragraph}>
            For your first day, we&rsquo;ve opened up <strong>three readings</strong>.
            Draw them when the question feels true — not before.
          </Text>

          <Section style={ctaWrap}>
            <Link href={`${appUrl}/home`} style={cta}>
              Enter the sanctum
            </Link>
          </Section>

          <Hr style={hr} />

          <Text style={smallParagraph}>
            A few things to know:
          </Text>
          <Text style={smallParagraph}>
            · Every reading is personal. Your decks, your cards, your threads.
            <br />· The AI learns your voice as you go. Be honest with it.
            <br />· Share a reading and the link stays yours to revoke.
          </Text>

          <Text style={footer}>
            <Link href={appUrl} style={footerLink}>
              mystech.app
            </Link>
            {" "}· Reply to this email if you need us.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeEmail;

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

const brand = { textAlign: "center" as const, marginBottom: "32px" };
const brandMark = {
  color: "#d4a853",
  fontSize: "20px",
  letterSpacing: "0.25em",
  textTransform: "uppercase" as const,
  margin: 0,
};

const heading = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: 500,
  textAlign: "center" as const,
  margin: "0 0 20px",
};

const paragraph = {
  color: "rgba(230,225,217,0.85)",
  fontSize: "16px",
  lineHeight: 1.7,
  margin: "0 0 18px",
};

const smallParagraph = {
  color: "rgba(230,225,217,0.65)",
  fontSize: "14px",
  lineHeight: 1.7,
  margin: "0 0 12px",
};

const ctaWrap = { textAlign: "center" as const, margin: "30px 0 20px" };
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
  margin: "28px 0",
};

const footer = {
  color: "rgba(230,225,217,0.45)",
  fontSize: "12px",
  textAlign: "center" as const,
  marginTop: "24px",
};

const footerLink = { color: "#d4a853", textDecoration: "none" };
