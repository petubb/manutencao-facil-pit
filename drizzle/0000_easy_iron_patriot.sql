CREATE TABLE `chamados` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`titulo` text NOT NULL,
	`descricao` text NOT NULL,
	`solicitante` text NOT NULL,
	`local` text NOT NULL,
	`categoria` text NOT NULL,
	`prioridade` text DEFAULT 'media' NOT NULL,
	`status` text DEFAULT 'aberto' NOT NULL,
	`observacao_resolucao` text DEFAULT '' NOT NULL,
	`criado_em` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`atualizado_em` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_chamados_status` ON `chamados` (`status`);--> statement-breakpoint
CREATE INDEX `idx_chamados_criado_em` ON `chamados` (`criado_em`);
