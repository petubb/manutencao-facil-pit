import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const chamados = sqliteTable(
  "chamados",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    titulo: text("titulo").notNull(),
    descricao: text("descricao").notNull(),
    solicitante: text("solicitante").notNull(),
    local: text("local").notNull(),
    categoria: text("categoria").notNull(),
    prioridade: text("prioridade", { enum: ["baixa", "media", "alta"] })
      .notNull()
      .default("media"),
    status: text("status", {
      enum: ["aberto", "em_atendimento", "concluido"],
    })
      .notNull()
      .default("aberto"),
    observacaoResolucao: text("observacao_resolucao").notNull().default(""),
    criadoEm: text("criado_em").notNull().default(sql`CURRENT_TIMESTAMP`),
    atualizadoEm: text("atualizado_em").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_chamados_status").on(table.status),
    index("idx_chamados_criado_em").on(table.criadoEm),
  ],
);

export type Chamado = typeof chamados.$inferSelect;
export type NovoChamado = typeof chamados.$inferInsert;

