import { NextResponse } from "next/server";
import { lireAnalyse, validerCle } from "@/lib/serveur/analyses";
import { stripe } from "@/lib/serveur/stripe";
import { site } from "@/lib/site";

export const runtime = "nodejs";

// Crée la session de paiement Stripe intégrée à la page.
export async function POST(req: Request) {
  let corps: { cle?: unknown; formule?: unknown };
  try {
    corps = await req.json();
  } catch {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }
  const { cle, formule } = corps;
  if (!validerCle(cle) || (formule !== "audit" && formule !== "veille")) {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }
  try {
    const analyse = await lireAnalyse(cle);
    if (!analyse) return NextResponse.json({ erreur: "Analyse introuvable." }, { status: 404 });
    if (analyse.payee) return NextResponse.json({ dejaPayee: true });

    const prix = await stripe.prixParCle(["fantomes_audit", "fantomes_veille"]);
    const audit = prix.data.find((p) => p.lookup_key === "fantomes_audit");
    const veille = prix.data.find((p) => p.lookup_key === "fantomes_veille");
    if (!audit || !veille) throw new Error("Prix Stripe introuvables");

    const origine = new URL(req.url).origin.startsWith("http://localhost") ? new URL(req.url).origin : site.url;
    const metadata = { analyse_id: analyse.id, formule };
    const commun = {
      ui_mode: "embedded_page",
      locale: "fr",
      client_reference_id: analyse.id,
      metadata,
      return_url: `${origine}/mes-fantomes/${cle}?session_id={CHECKOUT_SESSION_ID}`,
      branding_settings: {
        display_name: "Fantômes",
        background_color: "#f5f0e6",
        button_color: "#c23b22",
        border_style: "rounded",
      },
    };
    const session =
      formule === "audit"
        ? await stripe.creerSession({
            ...commun,
            mode: "payment",
            line_items: [{ price: audit.id, quantity: 1 }],
            payment_intent_data: { metadata },
          })
        : await stripe.creerSession({
            ...commun,
            mode: "subscription",
            line_items: [
              { price: veille.id, quantity: 1 },
              { price: audit.id, quantity: 1 },
            ],
            subscription_data: { trial_period_days: 30, metadata },
          });
    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (e) {
    console.error("checkout", e);
    return NextResponse.json({ erreur: "Le paiement n'a pas pu démarrer. Réessaie dans un instant." }, { status: 500 });
  }
}
