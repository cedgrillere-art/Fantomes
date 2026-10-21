import type { Metadata } from "next";
import PageLegale from "@/components/PageLegale";
import { editeur } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site Fantômes.",
};

export default function MentionsLegales() {
  return (
    <PageLegale titre="Mentions légales" majLe="21 octobre 2026">
      <h2>Éditeur du site</h2>
      <p>
        {editeur.nom}
        <br />
        {editeur.statut}
        <br />
        SIRET : {editeur.siret}
        <br />
        Adresse : {editeur.adresse}
        <br />
        Contact : {editeur.email}
        <br />
        TVA : {editeur.tva}
      </p>

      <h2>Directeur de la publication</h2>
      <p>{editeur.directeurPublication}</p>

      <h2>Hébergement</h2>
      <p>
        Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
        Site : vercel.com.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Les textes, le logo et l'interface de Fantômes sont protégés. Toute
        reproduction sans autorisation écrite de l'éditeur est interdite.
      </p>

      <h2>Contact</h2>
      <p>Pour toute question, écris à {editeur.email}.</p>
    </PageLegale>
  );
}
