import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "../../../db";
import { chamados } from "../../../db/schema";

const novoChamadoSchema = z.object({
  titulo: z.string().trim().min(4).max(120),
  descricao: z.string().trim().min(10).max(1200),
  solicitante: z.string().trim().min(2).max(100),
  local: z.string().trim().min(2).max(120),
  categoria: z.enum(["Elétrica", "Hidráulica", "Climatização", "Estrutura", "Outros"]),
  prioridade: z.enum(["baixa", "media", "alta"]),
});

function mensagemDoErro(error: unknown) {
  const message = error instanceof Error ? error.message : "Erro inesperado";
  if (message.includes("no such table") || message.includes('from "chamados"')) {
    return "A base de chamados ainda não está disponível.";
  }
  return "Não foi possível acessar os chamados agora.";
}

export async function GET(request: Request) {
  try {
    const status = new URL(request.url).searchParams.get("status");
    const db = getDb();
    const query = db
      .select()
      .from(chamados)
      .orderBy(desc(chamados.criadoEm), desc(chamados.id))
      .limit(100);

    const rows =
      status && ["aberto", "em_atendimento", "concluido"].includes(status)
        ? await query.where(
            eq(
              chamados.status,
              status as "aberto" | "em_atendimento" | "concluido",
            ),
          )
        : await query;

    return Response.json({ chamados: rows });
  } catch (error) {
    return Response.json({ error: mensagemDoErro(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const validation = novoChamadoSchema.safeParse(await request.json());
    if (!validation.success) {
      return Response.json(
        { error: "Revise os campos obrigatórios antes de salvar." },
        { status: 400 },
      );
    }

    const db = getDb();
    const [chamado] = await db
      .insert(chamados)
      .values(validation.data)
      .returning();

    return Response.json({ chamado }, { status: 201 });
  } catch (error) {
    return Response.json({ error: mensagemDoErro(error) }, { status: 500 });
  }
}

