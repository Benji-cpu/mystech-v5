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
import {
  body,
  brand,
  brandMark,
  container,
  ctaWrap,
  cta,
  footer,
  footerLink,
  hr,
  paragraph,
  smallParagraph,
} from "./_shared-styles";

type Props = {
  name?: string | null;
  orderId: string;
  deckTitle: string;
  carrier: string;
  tracking: string;
  appUrl: string;
};

const trackingUrl = (carrier: string, tracking: string) => {
  const c = carrier.toLowerCase();
  if (c.includes("usps")) return `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${tracking}`;
  if (c.includes("ups")) return `https://www.ups.com/track?tracknum=${tracking}`;
  if (c.includes("fedex")) return `https://www.fedex.com/fedextrack/?tracknumbers=${tracking}`;
  if (c.includes("dhl")) return `https://www.dhl.com/global-en/home/tracking.html?tracking-id=${tracking}`;
  return null;
};

export function PrintOrderShippedEmail({
  name,
  orderId,
  deckTitle,
  carrier,
  tracking,
  appUrl,
}: Props) {
  const greeting = name ? `It's on the way, ${name}` : "It's on the way";
  const url = trackingUrl(carrier, tracking);
  return (
    <Html>
      <Head />
      <Preview>{deckTitle} has shipped — {carrier} {tracking}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={brand}>
            <Text style={brandMark}>✦ MysTech</Text>
          </Section>
          <Heading style={heading}>{greeting}</Heading>
          <Text style={paragraph}>
            Your printed copy of <strong>{deckTitle}</strong> is on its way.
          </Text>
          <Text style={smallParagraph}>
            Carrier: <strong>{carrier}</strong>
            <br />
            Tracking: <strong>{tracking}</strong>
          </Text>
          {url ? (
            <Section style={ctaWrap}>
              <Link href={url} style={cta}>Track package</Link>
            </Section>
          ) : null}
          <Hr style={hr} />
          <Text style={footer}>
            Order <Link href={`${appUrl}/orders/${orderId}`} style={footerLink}>{orderId}</Link>
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

export default PrintOrderShippedEmail;
