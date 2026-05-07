import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { brand, body, container, brandMark, hr, footer, footerLink, paragraph, smallParagraph, ctaWrap, cta } from "./_shared-styles";

type Props = {
  name?: string | null;
  orderId: string;
  deckTitle: string;
  cardCount: number;
  amountTotal: number; // cents
  currency: string;
  appUrl: string;
};

export function PrintOrderConfirmationEmail({
  name,
  orderId,
  deckTitle,
  cardCount,
  amountTotal,
  currency,
  appUrl,
}: Props) {
  const greeting = name ? `Thank you, ${name}` : "Thank you";
  const formatted = `${(amountTotal / 100).toFixed(2)} ${currency.toUpperCase()}`;
  return (
    <Html>
      <Head />
      <Preview>Your printed {deckTitle} is in production.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={brand}>
            <Text style={brandMark}>✦ MysTech</Text>
          </Section>

          <Heading style={heading}>{greeting}</Heading>
          <Text style={paragraph}>
            We&rsquo;ve received your order for a printed copy of{" "}
            <strong>{deckTitle}</strong> — {cardCount} cards, plus card-back
            and box art.
          </Text>
          <Text style={paragraph}>
            The deck will be hand-prepared by our print partner over the next{" "}
            <strong>7–10 business days</strong>. We&rsquo;ll email tracking the
            moment it ships.
          </Text>

          <Section style={ctaWrap}>
            <Link href={`${appUrl}/orders/${orderId}`} style={cta}>
              View order
            </Link>
          </Section>

          <Hr style={hr} />

          <Text style={smallParagraph}>
            Order ID: <strong>{orderId}</strong>
            <br />
            Total: <strong>{formatted}</strong>
            <br />
            Refund window: 24h from this email.
          </Text>

          <Text style={footer}>
            <Link href={appUrl} style={footerLink}>
              mystech.app
            </Link>{" "}
            · Reply to this email if anything looks off.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const heading = {
  color: "#ffffff",
  fontSize: "26px",
  fontWeight: 500,
  textAlign: "center" as const,
  margin: "0 0 18px",
};

export default PrintOrderConfirmationEmail;
