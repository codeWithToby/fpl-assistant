import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Same armband motif as the navbar Logo — a banded stripe wrapped at an
// angle with a small mark on it — simplified further since a 32px favicon
// can't hold the navbar version's finer star detail.
export default function Icon() {
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
