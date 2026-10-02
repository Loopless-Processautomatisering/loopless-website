import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Loopless — AI-automatisering voor het MKB";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFFFF",
          position: "relative",
        }}
      >
        {/* Subtle gradient accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #22D3EE, #4F8EF7, #A78BFA)",
            display: "flex",
          }}
        />

        {/* Logo text */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              fontSize: "72px",
              fontWeight: 700,
              color: "#1B3A5C",
              letterSpacing: "-1px",
            }}
          >
            Loop
          </span>
          <span
            style={{
              fontSize: "72px",
              fontWeight: 700,
              color: "#22B8CF",
              letterSpacing: "-1px",
            }}
          >
            less
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "28px",
            color: "#5F6B85",
            textAlign: "center",
            maxWidth: "700px",
            lineHeight: 1.4,
            display: "flex",
          }}
        >
          AI-automatisering voor het MKB
        </div>

        {/* Service pills */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "40px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {["Leads uitzoeken", "Offertes klaarzetten", "Vragen & kennis", "Maatwerk uitzoekwerk"].map(
            (service) => (
              <div
                key={service}
                style={{
                  padding: "8px 20px",
                  borderRadius: "999px",
                  border: "1px solid #DCE6F5",
                  backgroundColor: "#F3F7FD",
                  color: "#2B3446",
                  fontSize: "16px",
                  display: "flex",
                }}
              >
                {service}
              </div>
            )
          )}
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            fontSize: "18px",
            color: "#4F8EF7",
            display: "flex",
          }}
        >
          loopless.nl
        </div>
      </div>
    ),
    { ...size }
  );
}
