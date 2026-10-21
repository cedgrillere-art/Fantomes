import { NextResponse } from "next/server";
import { lireAnalyse, validerCle } from "@/lib/serveur/analyses";
import { stripe } from "@/lib/serveur/stripe";
import { supabaseAdmin } from "@/lib/serveur/supabase";

export const runtime = "nodejs";

// Résiliation de la Veille en un clic (obligation légale pour un abonnement pris en ligne).
// Elle prend effet à la fin du mois en cours : aucun prélèvement ensuite.
export async function POST(req: Request) {
  let cle: unknown;
  try {
    cle = ((await req.json()) as { cle?: unknown })?.cle;
  } catch {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }
  if (!validerCle(cle)) return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  const analyse = await lireAnalyse(cle);
  if (!analyse?.payee || analyse.formule !== "veille") {
    return NextResponse.json({ erreur: "Aucune Veille active." }, { status: 404 });
  }
  const db = supabaseAdmin();
  const { data } = await db
    .from("paiements")
    .select("id, stripe_subscription_id")
    .eq("analyse_id", analyse.id)
    .eq("formule", "veille")
    .not("stripe_subscription_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data?.stripe_subscription_id) return NextResponse.json({ erreur: "Aucune Veille active." }, { status: 404 });
  try {
    const ab = await stripe.resilierAbonnement(data.stripe_subscription_id);
    const fin = ab.items?.data?.[0]?.current_period_end ?? ab.current_period_end;
    const finPeriode = fin ? new Date(fin * 1000).toISOString() : null;
    await db.from("paiements").update({ statut: "resilie", fin_periode: finPeriode }).eq("id", data.id);
    return NextResponse.json({ ok: true, finPeriode });
  } catch (e) {
    console.error("resilier", e);
    return NextResponse.json({ erreur: "La résiliation n'a pas abouti. Réessaie ou écris-nous." }, { status: 500 });
  }
}
