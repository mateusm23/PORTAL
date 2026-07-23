// Único admin do sistema por enquanto (sem tabela de papéis/roles ainda).
// Mesmo email usado nas políticas de RLS no Supabase — ver webapp/supabase/*.sql.
export const ADMIN_EMAIL = "mateusnunesmonteiro@gmail.com";

export function ehAdmin(email: string | null | undefined) {
  return email === ADMIN_EMAIL;
}
