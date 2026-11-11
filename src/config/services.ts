// Claves públicas: identifican el proyecto; no conceden acceso administrativo.
export const memoriesService = {
 url: import.meta.env.VITE_SUPABASE_URL || 'https://ubknchfowemwolytvmex.supabase.co',
 key: import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YfwKHU5ObNqTGoOk9QSc9Q_ih1oslEc',
 sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAF8EZoEBlk9vlRUc',
};
