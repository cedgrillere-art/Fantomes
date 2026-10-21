import type { Metadata } from "next";
import PageLegale from "@/components/PageLegale";
import { editeur, garantie } from "@/lib/site";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: "Conditions générales de vente de Fantômes.",
};

export default function CGV() {
  return (
    <PageLegale titre="Conditions générales de vente" majLe="21 octobre 2026">
      <h2>1. Qui vend quoi</h2>
      <p>
        Ces conditions s'appliquent aux achats effectués sur Fantômes, service
        édité par {editeur.nom}, {editeur.statut}, SIRET {editeur.siret},{" "}
        {editeur.adresse}, contact : {editeur.email}.
      </p>
      <p>
        Fantômes analyse un relevé bancaire déposé par l'utilisateur, repère les
        prélèvements réguliers, les classe par coût annuel, fournit pour chacun
        un modèle de lettre de résiliation et calcule le total économisé.
        Fantômes ne résilie aucun contrat à la place de l'utilisateur : c'est lui
        qui envoie les lettres.
      </p>

      <h2>2. Offres et prix</h2>
      <ul>
        <li>
          <strong>Audit complet</strong> : 19 € TTC, paiement unique. Donne accès
          à la liste complète des prélèvements détectés et à toutes les lettres
          de résiliation.
        </li>
        <li>
          <strong>Audit + Veille</strong> : 19 € TTC le jour de l'achat, puis
          4 € TTC par mois à partir du mois suivant, sans engagement. Comprend
          l'audit complet et permet de déposer un nouveau relevé chaque mois pour
          ajouter les nouveaux prélèvements à sa liste.
        </li>
      </ul>
      <p>{editeur.tva}</p>

      <h2>3. Paiement</h2>
      <p>
        Le paiement se fait par carte bancaire via Stripe, prestataire de
        paiement sécurisé. Fantômes n'a jamais accès aux numéros de carte.
      </p>

      <h2>4. Accès au service</h2>
      <p>
        L'accès s'ouvre immédiatement après la confirmation du paiement. Une
        adresse personnelle, affichée à ce moment-là, permet de revenir à sa liste
        plus tard ; elle doit être conservée et ne pas être partagée.
      </p>

      <h2>5. Garantie satisfait ou remboursé</h2>
      <p>
        Tu as <strong>{garantie.jours} jours</strong> après ton achat pour
        demander un remboursement intégral, sans avoir à te justifier. Il suffit
        d'écrire à {editeur.email} depuis l'adresse utilisée lors de l'achat. Le
        remboursement est lancé sous {garantie.delaiLancement} sur la carte
        utilisée ; selon ta banque, il apparaît sur ton compte sous 5 à 10 jours
        ouvrés.
      </p>
      <p>
        Cette garantie inclut et prolonge le droit de rétractation légal de 14
        jours prévu par le Code de la consommation.
      </p>

      <h2>6. Résiliation de la Veille</h2>
      <p>
        La Veille est sans engagement et résiliable à tout moment, en un clic
        depuis ta liste (bouton « Résilier la Veille ») ou par e-mail à{" "}
        {editeur.email}. La résiliation prend effet à la fin du mois en cours ;
        aucun prélèvement n'a lieu ensuite.
      </p>

      <h2>7. Responsabilité</h2>
      <p>
        La détection repose sur les informations du relevé fourni. Fantômes fait
        de son mieux pour repérer tous les prélèvements réguliers, sans pouvoir
        garantir qu'aucun ne lui échappe ni qu'un prélèvement détecté soit
        inutile pour toi : la décision de résilier t'appartient. Les lettres
        sont des modèles à vérifier avant envoi.
      </p>

      <h2>8. Médiation et litiges</h2>
      <p>
        En cas de désaccord, écris d'abord à {editeur.email}. À défaut de
        solution, tu peux recourir gratuitement au médiateur de la consommation :{" "}
        {editeur.mediateur}. Ces conditions sont soumises au droit français.
      </p>
    </PageLegale>
  );
}
