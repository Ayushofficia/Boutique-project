import "./globals.css";

export const metadata = {
  title: "The Art of Lifestyle — Arti Boutique",
  description: "Bespoke lehengas, bridal couture, suits, kurtas and blouses — made to measure by Arti Boutique.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
