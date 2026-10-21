alter table public.analyses
  add column cle_acces text unique check (cle_acces is null or char_length(cle_acces) = 48);
alter table public.prelevements
  add column categorie text not null default 'autre' check (char_length(categorie) <= 30);
alter table public.paiements
  add column fin_periode timestamptz;
