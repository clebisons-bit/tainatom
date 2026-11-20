import "./globals.css";
import { Source_Serif_4, Public_Sans } from "next/font/google";

const serif = Source_Serif_4({ subsets: ["latin"], variable: "--serif" });
const sans = Public_Sans({ subsets: ["latin"], variable: "--sans" });

export const metadata = {
  title: "Busca no acervo | Museu Histórico da FMUSP",
  description: "Pesquise objetos e fundos documentais do museu em um só lugar.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
