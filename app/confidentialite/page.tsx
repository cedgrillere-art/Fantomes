import type { Metadata } from "next";
import PageLegale from "@/components/PageLegale";
import { editeur } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Comment Fantômes traite tes données.",
};

export default function Confidentialite() {
  return (
    <PageLegale titre="Politique de confidentialité" majLe="21 octobre 2026">
      <h2>En bref</h2>
      <p>
        Ton relevé bancaire est analysé directement sur ton appareil. Le fichier
        n'est jamais envoyé sur nos serveurs. Seuls les prélèvements réguliers
        détectés (nom du service, montant, fréquence) sont enregistrés, pour te
        les montrer et préparer tes lettres.
      </p>

      <h2>Responsable du traitement</h2>
      <p>
        {editeur.nom}, {editeur.adresse}, contact : {editeur.email}.
      </p>

      <h2>Données collectées et pourquoi</h2>
      <ul>
        <li>
          <strong>Tes réponses aux trois questions</strong> : gardées seulement
          dans ton navigateur, le temps de ta visite, pour calculer ton
          estimation.
        </li>
        <li>
          <strong>Les prélèvements détectés</strong> : pour afficher ta liste,
          générer tes lettres et calculer ton total économisé. Base légale :
          exécution du contrat.
        </li>
        <li>
          <strong>Ton adresse e-mail</strong> : pour t'envoyer ton lien de
          connexion et ta facture. Base légale : exécution du contrat.
        </li>
        <li>
          <strong>Les données de paiement</strong> : traitées uniquement par
          Stripe. Nous ne voyons jamais ton numéro de carte.
        </li>
        <li>
          <strong>La mesure d'audience</strong> : statistiques anonymes de
          visite (Vercel Web Analytics), sans cookie et sans suivi d'une page à
          l'autre entre différents sites.
        </li>
      </ul>

      <h2>Durée de conservation</h2>
      <p>
        Tes données sont conservées tant que ton compte existe, puis supprimées
        dans les 30 jours suivant ta demande de suppression. Les factures sont
        conservées 10 ans, comme l'exige la loi.
      </p>

      <h2>Prestataires</h2>
      <ul>
        <li>Vercel (hébergement du site)</li>
        <li>Supabase (base de données et connexion)</li>
        <li>Stripe (paiement)</li>
        <li>Resend (envoi des e-mails)</li>
      </ul>
      <p>
        Certains de ces prestataires sont situés aux États-Unis ; les transferts
        sont encadrés par les clauses contractuelles types de la Commission
        européenne.
      </p>

      <h2>Tes droits</h2>
      <p>
        Tu peux accéder à tes données, les corriger, les supprimer, t'opposer à
        leur traitement ou les récupérer en écrivant à {editeur.email}. Réponse
        sous un mois. Tu peux aussi saisir la CNIL (cnil.fr).
      </p>
    </PageLegale>
  );
}
