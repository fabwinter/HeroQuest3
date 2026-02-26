import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "HeroQuest Map Generator",
  description: "Generate HeroQuest maps from the canonical 26x19 board"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
