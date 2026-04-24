import { ImageResponse } from "next/og";
import { getSharedReadingByToken } from "@/lib/db/queries";
import type { SpreadType } from "@/types";

export const runtime = "edge";
export const alt = "MysTech Oracle Reading";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SPREAD_LABELS: Record<SpreadType, string> = {
  single: "Single Card",
  three_card: "Three Card",
  five_card: "Five Card Cross",
  celtic_cross: "Celtic Cross",
  daily: "Daily Chronicle",
  quick: "Quick Draw",
};

export default async function OgImage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const reading = await getSharedReadingByToken(token);

  if (!reading) {
    return fallback("Reading Not Found");
  }

  const spreadLabel = SPREAD_LABELS[reading.spreadType as SpreadType] ?? reading.spreadType;
  const question = reading.question?.split("\n\nAdditional context:")[0]?.trim() ?? null;

  // Collect up to 3 cards with images
  const displayCards = reading.cards
    .filter((rc) => (rc.card?.imageUrl ?? rc.retreatCard?.imageUrl))
    .slice(0, 3)
    .map((rc) => ({
      imageUrl: rc.card?.imageUrl ?? rc.retreatCard?.imageUrl!,
      title: rc.card?.title ?? rc.retreatCard?.title ?? "",
      positionName: rc.positionName,
    }));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "radial-gradient(circle at 30% 30%, #2a1840 0%, #0a0614 60%, #000 100%)",
          padding: "60px 70px",
          fontFamily: "serif",
          color: "white",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: 28,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#d4a853",
              display: "flex",
            }}
          >
            ✦ MysTech
          </div>
          <div
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {reading.deckTitle ?? "Oracle"}
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 50,
          }}
        >
          {/* Cards column */}
          {displayCards.length > 0 && (
            <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
              {displayCards.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 140,
                      height: 220,
                      borderRadius: 12,
                      border: "1px solid rgba(212,168,83,0.4)",
                      overflow: "hidden",
                      display: "flex",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.imageUrl}
                      alt={c.title}
                      width={140}
                      height={220}
                      style={{ objectFit: "cover", width: "100%", height: "100%" }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.6)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      display: "flex",
                    }}
                  >
                    {c.positionName}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Text column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: 22,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              {spreadLabel} Reading
            </div>
            {question ? (
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 500,
                  lineHeight: 1.25,
                  color: "white",
                  fontStyle: "italic",
                  display: "flex",
                }}
              >
                &ldquo;{question.length > 140 ? `${question.slice(0, 137)}...` : question}&rdquo;
              </div>
            ) : (
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 500,
                  lineHeight: 1.25,
                  color: "white",
                  display: "flex",
                }}
              >
                An oracle reading drawn from the threads of story.
              </div>
            )}
            {reading.artStyleName && (
              <div
                style={{
                  fontSize: 18,
                  color: "#d4a853",
                  marginTop: 4,
                  display: "flex",
                }}
              >
                In the style of {reading.artStyleName}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 30,
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.6)",
              display: "flex",
            }}
          >
            Personalized oracle readings
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#d4a853",
              letterSpacing: "0.1em",
              display: "flex",
            }}
          >
            mystech-v5.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

function fallback(message: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0614",
          color: "#d4a853",
          fontSize: 48,
          fontFamily: "serif",
        }}
      >
        ✦ {message}
      </div>
    ),
    { ...size },
  );
}
