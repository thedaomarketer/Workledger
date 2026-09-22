-- Adds tax jurisdiction preferences (for the tax withholding estimate) and
-- an optional pay schedule per job (for payday awareness).

alter table public.user_settings
  add column tax_country text check (tax_country in ('CA', 'US')),
  add column tax_region text,
  add column tax_city text;

comment on column public.user_settings.tax_country is
  'Country used for the tax withholding estimate (lib/calculations/tax). Null = feature not set up yet.';
comment on column public.user_settings.tax_region is
  'Province code (CA) or state code (US) used for the tax withholding estimate.';
comment on column public.user_settings.tax_city is
  'Optional local jurisdiction code (currently NYC or PHILADELPHIA) for the tax withholding estimate.';

alter table public.jobs
  add column pay_frequency text check (pay_frequency in ('weekly', 'biweekly', 'semi_monthly', 'monthly')),
  add column pay_anchor_date date;

comment on column public.jobs.pay_frequency is
  'How often this job pays. Null = payday awareness not set up for this job.';
comment on column public.jobs.pay_anchor_date is
  'A known past or upcoming pay date for this job, used to project future paydays (lib/calculations/payday.ts).';
