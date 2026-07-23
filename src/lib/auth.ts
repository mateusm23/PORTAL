import type { createServerClient } from "@supabase/ssr";

type SupabaseServer = ReturnType<typeof createServerClient>;

export async function ehAdmin(supabase: SupabaseServer, userId: string | undefined) {
  if (!userId) return false;
  const { data } = await supabase.from("usuario").select("is_admin").eq("id", userId).single();
  return data?.is_admin ?? false;
}
