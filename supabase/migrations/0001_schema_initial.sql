-- Fantômes : schéma minimal du MVP
-- Trois tables : analyses, prelevements, paiements.
-- Les comptes clients sont gérés par Supabase (auth.users).
-- Tout ce qui écrit passe par le serveur (clé secrète). Les clients connectés
-- ne peuvent que lire leurs propres données et marquer un prélèvement comme résilié.

create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  email text check (email is null or char_length(email) <= 320),
  reponses jsonb not null default '{}'::jsonb,
  formule text check (formule in ('audit', 'veille')),
  payee boolean not null default false,
  created_at timestamptz not null default now()
);

create index analyses_user_id_idx on public.analyses (user_id);

create table public.prelevements (
  id uuid primary key default gen_random_uuid(),
  analyse_id uuid not null references public.analyses (id) on delete cascade,
  libelle text not null check (char_length(libelle) between 1 and 120),
  montant_centimes integer not null check (montant_centimes > 0 and montant_centimes < 10000000),
  frequence text not null check (frequence in ('hebdomadaire', 'mensuel', 'trimestriel', 'annuel')),
  cout_annuel_centimes integer not null check (cout_annuel_centimes >= 0),
  dernier_prelevement date,
  statut text not null default 'actif' check (statut in ('actif', 'resilie')),
  resilie_le timestamptz,
  created_at timestamptz not null default now()
);

create index prelevements_analyse_id_idx on public.prelevements (analyse_id);

create table public.paiements (
  id uuid primary key default gen_random_uuid(),
  analyse_id uuid references public.analyses (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  email text not null check (char_length(email) <= 320),
  formule text not null check (formule in ('audit', 'veille')),
  montant_centimes integer not null check (montant_centimes >= 0),
  stripe_session_id text not null unique,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  statut text not null check (statut in ('paye', 'actif', 'resilie', 'rembourse')),
  created_at timestamptz not null default now()
);

create index paiements_user_id_idx on public.paiements (user_id);
create index paiements_analyse_id_idx on public.paiements (analyse_id);

-- Sécurité : RLS partout. Sans politique, personne n'accède (sauf le serveur).
alter table public.analyses enable row level security;
alter table public.prelevements enable row level security;
alter table public.paiements enable row level security;

create policy "Lire ses analyses"
  on public.analyses for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Lire ses prélèvements"
  on public.prelevements for select to authenticated
  using (exists (
    select 1 from public.analyses a
    where a.id = analyse_id and a.user_id = (select auth.uid()) and a.payee
  ));

create policy "Marquer ses prélèvements"
  on public.prelevements for update to authenticated
  using (exists (
    select 1 from public.analyses a
    where a.id = analyse_id and a.user_id = (select auth.uid()) and a.payee
  ))
  with check (exists (
    select 1 from public.analyses a
    where a.id = analyse_id and a.user_id = (select auth.uid()) and a.payee
  ));

create policy "Lire ses paiements"
  on public.paiements for select to authenticated
  using (user_id = (select auth.uid()));

-- Les visiteurs anonymes n'ont aucun accès direct.
revoke all on public.analyses, public.prelevements, public.paiements from anon;

-- Un client connecté ne peut modifier que le statut d'un prélèvement.
revoke insert, update, delete on public.analyses, public.prelevements, public.paiements from authenticated;
grant update (statut, resilie_le) on public.prelevements to authenticated;
