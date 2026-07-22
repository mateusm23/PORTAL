import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AcessoCheckbox from "./AcessoCheckbox";

export default async function AcessosObrasPage({
  searchParams,
}: {
  searchParams: Promise<{ usuario?: string }>;
}) {
  const { usuario: usuarioIdParam } = await searchParams;
  const supabase = await createClient();

  const [{ data: usuarios }, { data: obras }, { data: acessos }] =
    await Promise.all([
      supabase.from("usuario").select("id, nome, email").order("email"),
      supabase.from("obra").select("id, nome").order("nome"),
      supabase.from("obra_usuario").select("usuario_id, obra_id"),
    ]);

  const usuarioSelecionado = usuarioIdParam ?? usuarios?.[0]?.id;
  const acessosDoUsuario = new Set(
    (acessos ?? [])
      .filter((a) => a.usuario_id === usuarioSelecionado)
      .map((a) => a.obra_id),
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
      <div className="flex flex-col gap-0.5">
        {(usuarios ?? []).map((u) => (
          <Link
            key={u.id}
            href={`/configuracoes/acessos/obras?usuario=${u.id}`}
            className={`rounded-md px-3 py-2 text-sm ${
              u.id === usuarioSelecionado
                ? "bg-blue-50 font-medium text-blue-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {u.nome || u.email}
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        {!usuarioSelecionado ? (
          <p className="text-sm text-slate-500">
            Nenhum usuário cadastrado ainda.
          </p>
        ) : (
          <>
            <h2 className="mb-4 text-sm font-medium text-slate-500">
              Obras liberadas para este usuário
            </h2>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {(obras ?? []).map((obra) => (
                <div
                  key={obra.id}
                  className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2"
                >
                  <span className="text-sm text-slate-900">{obra.nome}</span>
                  <AcessoCheckbox
                    usuarioId={usuarioSelecionado}
                    obraId={obra.id}
                    concedidoInicialmente={acessosDoUsuario.has(obra.id)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
