import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Same design as icon.tsx, scaled up for iOS home-screen — iOS applies
// its own corner mask, so this stays a plain filled square.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#00ff87",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "76%",
            height: "26%",
            background: "#37003c",
            borderRadius: 999,
            transform: "rotate(-9deg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "26%",
              height: "26%",
              background: "#00ff87",
              transform: "rotate(45deg)",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
