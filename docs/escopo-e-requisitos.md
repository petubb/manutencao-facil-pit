# Escopo e requisitos do Manutenção Fácil

## Problema

Em ambientes compartilhados, os pedidos de manutenção costumam chegar por canais dispersos. Isso dificulta a priorização, o acompanhamento, a comunicação com o solicitante e a criação de um histórico confiável.

## Objetivo

Centralizar as solicitações de manutenção e permitir que cada chamado seja acompanhado desde o registro até a conclusão.

## Usuários

- Solicitante: registra o problema e acompanha o status.
- Responsável pela manutenção: consulta, prioriza e atualiza os chamados.
- Gestor: acompanha volume, situação e histórico dos atendimentos.

## Requisitos funcionais

- RF01: cadastrar uma solicitação com título, descrição, solicitante, local, categoria e prioridade.
- RF02: listar as solicitações mais recentes.
- RF03: filtrar solicitações por status.
- RF04: alterar o status para aberto, em atendimento ou concluído.
- RF05: apresentar a quantidade de solicitações em cada status.
- RF06: manter os dados salvos após recarregar ou encerrar a sessão.

## Requisitos não funcionais

- RNF01: apresentar interface responsiva em computador e celular.
- RNF02: validar os campos obrigatórios antes do cadastro.
- RNF03: exibir mensagens claras quando uma operação falhar.
- RNF04: usar banco de dados relacional com migrações versionadas.
- RNF05: manter separação entre interface, regras de acesso e persistência.

## Regras de negócio

- Todo chamado começa com status aberto.
- Título, descrição, solicitante, local, categoria e prioridade são obrigatórios.
- A prioridade pode ser baixa, média ou alta.
- O status pode ser aberto, em atendimento ou concluído.
- Cada alteração registra uma nova data de atualização.

## Fora do escopo inicial

- Autenticação por perfil.
- Anexos de imagens.
- Atribuição do chamado a um técnico específico.
- Notificações por e-mail ou aplicativo.

Esses itens podem ser avaliados depois dos testes com usuários.

