import { Press_Start_2P } from "next/font/google";
import "nes.css/css/nes.min.css";
import "./globals.css";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./components/ThemeProvider";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
});

export const metadata = {
  title: "Buildo - Build Your Ideas",
  description: "All-in-one platform for makers to bring ideas to life with wiring diagrams, parts lists, build instructions, and more",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={pressStart.variable}>
        <ThemeProvider>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
