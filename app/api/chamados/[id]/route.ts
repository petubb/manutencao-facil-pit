import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "../../../../db";
import { chamados } from "../../../../db/schema";

const atualizacaoSchema = z.object({
  status: z.enum(["aberto", "em_atendimento", "concluido"]),
  observacaoResolucao: z.string().trim().max(600).optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await context.params;
    const id = Number(rawId);
    const validation = atualizacaoSchema.safeParse(await request.json());

    if (!Number.isInteger(id) || id <= 0 || !validation.success) {
      return Response.json({ error: "Atualização inválida." }, { status: 400 });
    }

    const db = getDb();
    const [chamado] = await db
      .update(chamados)
      .set({
        status: validation.data.status,
        observacaoResolucao: validation.data.observacaoResolucao ?? "",
        atualizadoEm: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(chamados.id, id))
      .returning();

    if (!chamado) {
      return Response.json({ error: "Chamado não encontrado." }, { status: 404 });
    }

    return Response.json({ chamado });
  } catch {
    return Response.json(
      { error: "Não foi possível atualizar o chamado agora." },
      { status: 500 },
    );
  }
}

