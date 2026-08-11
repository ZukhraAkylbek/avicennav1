REVOKE EXECUTE ON FUNCTION public.bootstrap_user_role() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;