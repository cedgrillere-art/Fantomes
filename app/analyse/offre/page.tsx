import type { Metadata } from "next";
import Offre from "./Offre";

export const metadata: Metadata = {
  title: "Ta liste, prête",
  robots: { index: false },
};

export default function PageOffre() {
  return <Offre />;
}
