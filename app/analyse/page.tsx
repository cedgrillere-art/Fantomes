import type { Metadata } from "next";
import Analyse from "./Analyse";

export const metadata: Metadata = {
  title: "Dépose ton relevé",
  description: "Dépose ton relevé : Fantômes repère tes prélèvements réguliers. Le fichier reste sur ton téléphone.",
  robots: { index: false },
};

export default function PageAnalyse() {
  return <Analyse />;
}
