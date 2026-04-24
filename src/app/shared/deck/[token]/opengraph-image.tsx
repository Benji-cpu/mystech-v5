import { ImageResponse } from "next/og";
import { getSharedDeckByToken } from "@/lib/db/queries";

export const runtime = "edge";
export const alt = "MysTech Oracle Deck";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const deck = await getSharedDeckByToken(token);

  if (!deck) {
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
          ✦ Deck Not Found
        </div>
      ),
      { ...size },
    );
  }

  // Pick up to 5 cards with images for the collage
  const cards = deck.cards.filter((c) => c.imageUrl).slice(0, 5);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "radial-gradient(circle at 70% 30%, #2a1840 0%, #0a0614 60%, #000 100%)",
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
            marginBottom: 30,
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
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Oracle Deck
          </div>
        </div>

        {/* Cards fan */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {cards.length > 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                width: 600,
                height: 380,
              }}
            >
              {cards.map((c, i) => {
                const offset = (i - (cards.length - 1) / 2) * 90;
                const rotate = (i - (cards.length - 1) / 2) * 8;
                return (
                  <div
                    key={c.id}
                    style={{
                      position: "absolute",
                      left: `calc(50% - 90px + ${offset}px)`,
                      top: 30,
                      width: 180,
                      height: 280,
                      borderRadius: 14,
                      border: "1px solid rgba(212,168,83,0.4)",
                      overflow: "hidden",
                      display: "flex",
                      boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
                      transform: `rotate(${rotate}deg)`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.imageUrl!}
                      alt={c.title}
                      width={180}
                      height={280}
                      style={{ objectFit: "cover", width: "100%", height: "100%" }}
                    />
                  </div>
                );
              })}
            </div>
          ) : deck.coverImageUrl ? (
            <div
              style={{
                width: 220,
                height: 340,
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid rgba(212,168,83,0.5)",
                display: "flex",
                boxShadow: "0 25px 60px rgba(0,0,0,0.7)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={deck.coverImageUrl}
                alt={deck.title}
                width={220}
                height={340}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            </div>
          ) : null}
        </div>

        {/* Title footer */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            marginTop: 20,
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              fontSize: 44,
              fontWeight: 600,
              color: "white",
              textAlign: "center",
              display: "flex",
            }}
          >
            {deck.title}
          </div>
          <div
            style={{
              display: "flex",
              gap: 24,
              fontSize: 18,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <span style={{ display: "flex" }}>{deck.cardCount} cards</span>
            {deck.artStyleName && (
              <>
                <span style={{ color: "rgba(255,255,255,0.3)", display: "flex" }}>
                  ·
                </span>
                <span style={{ color: "#d4a853", display: "flex" }}>
                  {deck.artStyleName}
                </span>
              </>
            )}
            <span style={{ color: "rgba(255,255,255,0.3)", display: "flex" }}>·</span>
            <span style={{ display: "flex" }}>mystech-v5.vercel.app</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
