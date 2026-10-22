import { ImageResponse } from "next/og";

export const alt = "Fantômes — Débusque les abonnements qu'on paie sans s'en servir.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f5f0e6",
          color: "#1c1b19",
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 700, display: "flex" }}>Fantômes</div>
        <div style={{ fontSize: 76, lineHeight: 1.08, fontWeight: 700, display: "flex" }}>
          Débusque les abonnements qu'on paie sans s'en servir.
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "3px dashed #ddd4c4",
            paddingTop: 28,
            fontSize: 34,
            fontFamily: "monospace",
            color: "#c23b22",
          }}
        >
          <span>PRLV SEPA ABONNEMENT OUBLIÉ</span>
          <span>−95,88 € / an</span>
        </div>
      </div>
    ),
    size
  );
}
