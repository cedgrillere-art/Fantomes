import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabasePublic } from "@/lib/site";

let client: SupabaseClient | null = null;

/** Client Supabase côté serveur, avec la clé secrète (jamais envoyée au navigateur). */
export function supabaseAdmin(): SupabaseClient {
  if (client) return client;
  const secret = process.env.SUPABASE_SECRET_KEY?.trim(); // retire un espace ou retour à la ligne collé par erreur
  if (!secret) throw new Error("SUPABASE_SECRET_KEY manquante");
  client = createClient(supabasePublic.url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
