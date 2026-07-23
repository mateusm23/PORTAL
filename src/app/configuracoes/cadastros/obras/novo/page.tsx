import { createClient } from "@/lib/supabase/server";
import ObraForm from "../ObraForm";

export default async function NovaObraPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("obra")
    .select("cidade")
    .not("cidade", "is", null);

  const cidadesExistentes = Array.from(
    new Set((data ?? []).map((o) => o.cidade).filter(Boolean) as string[]),
  ).sort();

  return (
    <div>
      <h2 className="mb-4 text-sm font-medium text-slate-500">Nova obra</h2>
      <ObraForm cidadesExistentes={cidadesExistentes} />
    </div>
  );
}
