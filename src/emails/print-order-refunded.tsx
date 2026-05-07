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
} from "@react-email/components";
import {
  body,
  brand,
  brandMark,
  container,
  footer,
  footerLink,
  paragraph,
} from "./_shared-styles";

type Props = {
  name?: string | null;
  orderId: string;
  deckTitle: string;
  appUrl: string;
};

export function PrintOrderRefundedEmail({ name, orderId, deckTitle, appUrl }: Props) {
  const greeting = name ? `${name}, your refund is processed` : "Your refund is processed";
  return (
    <Html>
      <Head />
      <Preview>Refund processed for {deckTitle}.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={brand}>
            <Text style={brandMark}>✦ MysTech</Text>
          </Section>
          <Heading style={heading}>{greeting}</Heading>
          <Text style={paragraph}>
            We&rsquo;ve refunded your order for <strong>{deckTitle}</strong>.
            Funds typically appear in 5–10 business days depending on your bank.
          </Text>
          <Text style={paragraph}>
            If something prompted the refund that we should know about, please
            reply to this email — we read every reply.
          </Text>
          <Text style={footer}>
            Order{" "}
            <Link href={`${appUrl}/orders/${orderId}`} style={footerLink}>
              {orderId}
            </Link>
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

export default PrintOrderRefundedEmail;
