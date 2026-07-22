import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = process.env.NODE_ENV === "development"
  ? {
      title: "Living Control Room · Development Preview",
      robots: {
        index: false,
        follow: false,
      },
    }
  : {
      title: "Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };

export default async function ControlRoomPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  const { ControlRoomPreview } = await import(
    "@/components/brb/control-room/ControlRoomPreview"
  );
  return <ControlRoomPreview />;
}
