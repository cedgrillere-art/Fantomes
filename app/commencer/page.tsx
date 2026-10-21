import type { Metadata } from "next";
import Parcours from "./Parcours";

export const metadata: Metadata = {
  title: "Trois questions",
  description:
    "Trois questions pour estimer ce que tes abonnements oubliés te coûtent chaque année.",
};

export default function Commencer() {
  return <Parcours />;
}
