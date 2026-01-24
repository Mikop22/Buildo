import { Press_Start_2P } from "next/font/google";
import "nes.css/css/nes.min.css";
import "./globals.css";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
});

export const metadata = {
  title: "Retro Pixel Adventure",
  description: "Welcome to the 8-bit world of pixels and nostalgia!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={pressStart.variable}>
        {children}
      </body>
    </html>
  );
}
