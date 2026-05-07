// Shared inline-style tokens used by transactional email templates.
// Mirrors the look-and-feel of welcome.tsx without depending on it.

export const body = {
  backgroundColor: "#0a0614",
  fontFamily: "Georgia, 'Times New Roman', serif",
  color: "#e6e1d9",
  margin: 0,
  padding: "40px 20px",
};

export const container = {
  maxWidth: "560px",
  margin: "0 auto",
  backgroundColor: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "14px",
  padding: "36px 30px",
};

export const brand = { textAlign: "center" as const, marginBottom: "32px" };
export const brandMark = {
  color: "#d4a853",
  fontSize: "20px",
  letterSpacing: "0.25em",
  textTransform: "uppercase" as const,
  margin: 0,
};

export const paragraph = {
  color: "rgba(230,225,217,0.85)",
  fontSize: "16px",
  lineHeight: 1.7,
  margin: "0 0 18px",
};

export const smallParagraph = {
  color: "rgba(230,225,217,0.65)",
  fontSize: "14px",
  lineHeight: 1.7,
  margin: "0 0 12px",
};

export const ctaWrap = { textAlign: "center" as const, margin: "30px 0 20px" };
export const cta = {
  backgroundColor: "#d4a853",
  color: "#0a0614",
  padding: "14px 28px",
  borderRadius: "999px",
  fontWeight: 600,
  textDecoration: "none",
  display: "inline-block",
  letterSpacing: "0.02em",
};

export const hr = {
  border: "none",
  borderTop: "1px solid rgba(255,255,255,0.1)",
  margin: "28px 0",
};

export const footer = {
  color: "rgba(230,225,217,0.45)",
  fontSize: "12px",
  textAlign: "center" as const,
  marginTop: "24px",
};

export const footerLink = { color: "#d4a853", textDecoration: "none" };
