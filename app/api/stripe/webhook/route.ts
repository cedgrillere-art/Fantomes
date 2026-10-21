import { NextResponse } from "next/server";
import { enregistrerPaiement } from "@/lib/serveur/analyses";
import { stripe, type AbonnementStripe, type SessionStripe } from "@/lib/serveur/stripe";
import { supabaseAdmin } from "@/lib/serveur/supabase";

export const runtime = "nodejs";

// Stripe prévient ici à chaque événement de paiement.
// Sécurité : on ne fait jamais confiance au contenu reçu. On relit l'événement
// directement chez Stripe avec notre clé secrète : un faux appel n'a donc aucun effet.
export async function POST(req: Request) {
  let id: unknown;
  try {
    id = ((await req.json()) as { id?: unknown })?.id;
  } catch {
    return NextResponse.json({ recu: false }, { status: 400 });
  }
  if (typeof id !== "string" || !/^evt_[A-Za-z0-9]+$/.test(id)) {
    return NextResponse.json({ recu: false }, { status: 400 });
  }

  try {
    const evt = await stripe.lireEvenement(id);
    const objet = evt.data.object;
    const db = supabaseAdmin();

    switch (evt.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await enregistrerPaiement(objet as unknown as SessionStripe);
        break;

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const ab = objet as unknown as AbonnementStripe;
        const fin = ab.items?.data?.[0]?.current_period_end ?? ab.current_period_end;
        const statut = evt.type === "customer.subscription.deleted" || ab.cancel_at_period_end ? "resilie" : "actif";
        await db
          .from("paiements")
          .update({ statut, fin_periode: fin ? new Date(fin * 1000).toISOString() : null })
          .eq("stripe_subscription_id", ab.id);
        break;
      }

      case "charge.refunded": {
        // Remboursement total : on le note sur le paiement (l'accès reste ouvert, par simplicité).
        const charge = objet as { customer?: string | null; refunded?: boolean };
        if (charge.refunded && charge.customer) {
          await db.from("paiements").update({ statut: "rembourse" }).eq("stripe_customer_id", charge.customer);
        }
        break;
      }
    }
    return NextResponse.json({ recu: true });
  } catch (e) {
    console.error("webhook", e);
    // 500 : Stripe réessaiera automatiquement.
    return NextResponse.json({ recu: false }, { status: 500 });
  }
}
