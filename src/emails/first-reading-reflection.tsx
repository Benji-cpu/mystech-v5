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
  readingUrl: string | null;
  spreadLabel: string;
  appUrl: string;
};

export function FirstReadingReflectionEmail({
  name,
  readingUrl,
  spreadLabel,
  appUrl,
}: Props) {
  const greeting = name ? `${name},` : "A small note,";

  return (
    <Html>
      <Head />
      <Preview>How did that first reading land?</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={brand}>
            <Text style={brandMark}>✦ MysTech</Text>
          </Section>

          <Heading style={heading}>{greeting}</Heading>
          <Text style={paragraph}>
            Your first <strong>{spreadLabel}</strong> reading is behind you.
          </Text>
          <Text style={paragraph}>
            Sit with it. The cards never mean only one thing — return to them
            tomorrow, in a different mood, and listen again.
          </Text>

          {readingUrl && (
            <Section style={ctaWrap}>
              <Link href={readingUrl} style={cta}>
                Revisit your reading
              </Link>
            </Section>
          )}

          <Hr style={hr} />

          <Text style={smallParagraph}>
            Two more readings are waiting for you today. Bring a question that
            actually matters — that&rsquo;s when the cards sharpen.
          </Text>

          <Section style={{ textAlign: "center" as const, marginTop: "20px" }}>
            <Link href={`${appUrl}/home`} style={ghostCta}>
              Draw again →
            </Link>
          </Section>

          <Text style={footer}>
            <Link href={appUrl} style={footerLink}>
              mystech.app
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default FirstReadingReflectionEmail;

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
  fontSize: "26px",
  fontWeight: 500,
  textAlign: "center" as const,
  margin: "0 0 18px",
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

const ctaWrap = { textAlign: "center" as const, margin: "28px 0 4px" };
const cta = {
  backgroundColor: "#d4a853",
  color: "#0a0614",
  padding: "13px 26px",
  borderRadius: "999px",
  fontWeight: 600,
  textDecoration: "none",
  display: "inline-block",
};

const ghostCta = {
  color: "#d4a853",
  textDecoration: "none",
  fontSize: "15px",
  letterSpacing: "0.05em",
};

const hr = {
  border: "none",
  borderTop: "1px solid rgba(255,255,255,0.1)",
  margin: "26px 0",
};

const footer = {
  color: "rgba(230,225,217,0.45)",
  fontSize: "12px",
  textAlign: "center" as const,
  marginTop: "24px",
};

const footerLink = { color: "#d4a853", textDecoration: "none" };
