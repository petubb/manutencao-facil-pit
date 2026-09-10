# Manutenção Fácil

Sistema web para registrar, priorizar e acompanhar solicitações de manutenção em ambientes compartilhados, como escolas, condomínios e pequenas empresas.

## Problema escolhido

Solicitações feitas por mensagens, ligações ou conversas informais podem ser esquecidas, duplicadas ou atendidas sem registro. O solicitante não consegue acompanhar o andamento e a equipe responsável perde informações importantes para priorizar e comprovar os reparos.

## Primeira versão

- Cadastro de chamados com solicitante, local, categoria, prioridade e descrição.
- Listagem persistida em banco de dados.
- Filtro por status.
- Atualização do fluxo entre aberto, em atendimento e concluído.
- Painel com totais por situação.
- Interface responsiva para computador e celular.
- Validação de dados e mensagens de erro recuperáveis.

## Tecnologias

- TypeScript e React para a interface.
- Rotas HTTP para o back-end.
- Cloudflare D1, compatível com SQLite, para persistência.
- Drizzle ORM para esquema e migrações.
- Tailwind CSS e componentes acessíveis para a interface.

## Organização

- `app/`: telas e rotas HTTP.
- `db/`: modelo de dados.
- `drizzle/`: migrações versionadas.
- `docs/`: escopo, requisitos e modelagem.

## Execução local

1. Instale as dependências.
2. Gere e aplique as migrações do banco D1 local.
3. Inicie o servidor de desenvolvimento.
4. Acesse a URL exibida no terminal.

As instruções detalhadas de execução e publicação serão consolidadas na documentação final da PIT.

