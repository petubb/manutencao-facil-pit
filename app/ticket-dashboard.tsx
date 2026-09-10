"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock3,
  Inbox,
  Loader2,
  Plus,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type Status = "aberto" | "em_atendimento" | "concluido";
type Prioridade = "baixa" | "media" | "alta";

type Chamado = {
  id: number;
  titulo: string;
  descricao: string;
  solicitante: string;
  local: string;
  categoria: string;
  prioridade: Prioridade;
  status: Status;
  observacaoResolucao: string;
  criadoEm: string;
  atualizadoEm: string;
};

type NovoChamado = Pick<
  Chamado,
  "titulo" | "descricao" | "solicitante" | "local" | "categoria" | "prioridade"
>;

const formularioInicial: NovoChamado = {
  titulo: "",
  descricao: "",
  solicitante: "",
  local: "",
  categoria: "Outros",
  prioridade: "media",
};

const statusLabel: Record<Status, string> = {
  aberto: "Aberto",
  em_atendimento: "Em atendimento",
  concluido: "Concluído",
};

const priorityLabel: Record<Prioridade, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

const statusClasses: Record<Status, string> = {
  aberto: "border-amber-200 bg-amber-50 text-amber-800",
  em_atendimento: "border-blue-200 bg-blue-50 text-blue-800",
  concluido: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

const priorityClasses: Record<Prioridade, string> = {
  baixa: "text-slate-600",
  media: "text-amber-700",
  alta: "font-semibold text-rose-700",
};

function humanDate(value: string) {
  const parsed = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(parsed);
}

export function TicketDashboard() {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [filtro, setFiltro] = useState<"todos" | Status>("todos");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dados, setDados] = useState<NovoChamado>(formularioInicial);

  const carregarChamados = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const response = await fetch("/api/chamados", { cache: "no-store" });
      const body = (await response.json()) as { chamados?: Chamado[]; error?: string };
      if (!response.ok) throw new Error(body.error || "Não foi possível carregar os chamados.");
      setChamados(body.chamados ?? []);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível carregar os chamados.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarChamados();
  }, [carregarChamados]);

  const criarChamado = useCallback(async (payload: NovoChamado) => {
    const response = await fetch("/api/chamados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await response.json()) as { chamado?: Chamado; error?: string };
    if (!response.ok || !body.chamado) {
      throw new Error(body.error || "Não foi possível criar o chamado.");
    }
    setChamados((current) => [body.chamado!, ...current]);
    return body.chamado;
  }, []);

  useEffect(() => {
    type ModelContext = {
      registerTool: (
        tool: {
          name: string;
          title: string;
          description: string;
          inputSchema: object;
          annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
          execute: (input: unknown) => Promise<unknown>;
        },
        options: { signal: AbortSignal },
      ) => void | Promise<void>;
    };

    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;

    const lifecycle = new AbortController();
    void Promise.resolve(
      context.registerTool(
        {
          name: "criar_chamado_manutencao",
          title: "Criar chamado de manutenção",
          description: "Registra uma nova solicitação e a adiciona ao painel visível.",
          inputSchema: {
            type: "object",
            properties: {
              titulo: { type: "string", minLength: 4, maxLength: 120 },
              descricao: { type: "string", minLength: 10, maxLength: 1200 },
              solicitante: { type: "string", minLength: 2, maxLength: 100 },
              local: { type: "string", minLength: 2, maxLength: 120 },
              categoria: {
                type: "string",
                enum: ["Elétrica", "Hidráulica", "Climatização", "Estrutura", "Outros"],
              },
              prioridade: { type: "string", enum: ["baixa", "media", "alta"] },
            },
            required: ["titulo", "descricao", "solicitante", "local", "categoria", "prioridade"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          async execute(input) {
            const payload = input as NovoChamado;
            if (
              !payload ||
              typeof payload.titulo !== "string" ||
              typeof payload.descricao !== "string" ||
              typeof payload.solicitante !== "string" ||
              typeof payload.local !== "string"
            ) {
              throw new Error("Dados do chamado inválidos.");
            }
            const chamado = await criarChamado(payload);
            return { id: chamado.id, status: chamado.status };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => undefined);

    return () => lifecycle.abort();
  }, [criarChamado]);

  const visiveis = useMemo(
    () => (filtro === "todos" ? chamados : chamados.filter((item) => item.status === filtro)),
    [chamados, filtro],
  );

  const totais = useMemo(
    () => ({
      aberto: chamados.filter((item) => item.status === "aberto").length,
      em_atendimento: chamados.filter((item) => item.status === "em_atendimento").length,
      concluido: chamados.filter((item) => item.status === "concluido").length,
    }),
    [chamados],
  );

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSalvando(true);
    try {
      await criarChamado(dados);
      setDados(formularioInicial);
      setDialogAberto(false);
      toast.success("Solicitação registrada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  async function atualizarStatus(chamado: Chamado, status: Status) {
    const anterior = chamado.status;
    setChamados((current) =>
      current.map((item) => (item.id === chamado.id ? { ...item, status } : item)),
    );
    try {
      const response = await fetch(`/api/chamados/${chamado.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = (await response.json()) as { chamado?: Chamado; error?: string };
      if (!response.ok || !body.chamado) throw new Error(body.error || "Atualização recusada.");
      setChamados((current) =>
        current.map((item) => (item.id === chamado.id ? body.chamado! : item)),
      );
      toast.success("Status atualizado.");
    } catch (error) {
      setChamados((current) =>
        current.map((item) => (item.id === chamado.id ? { ...item, status: anterior } : item)),
      );
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar.");
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Wrench className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg font-bold tracking-tight">Manutenção Fácil</p>
              <p className="text-sm text-muted-foreground">Central de solicitações</p>
            </div>
          </div>

          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button className="h-10 rounded-xl px-4">
                <Plus className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Nova solicitação</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
              <form onSubmit={enviarFormulario}>
                <DialogHeader>
                  <DialogTitle>Nova solicitação</DialogTitle>
                  <DialogDescription>
                    Descreva o problema para facilitar a triagem e o atendimento.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-5 sm:grid-cols-2">
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="titulo">Título do problema</Label>
                    <Input
                      id="titulo"
                      required
                      minLength={4}
                      maxLength={120}
                      placeholder="Ex.: Vazamento na torneira da copa"
                      value={dados.titulo}
                      onChange={(event) => setDados({ ...dados, titulo: event.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="solicitante">Solicitante</Label>
                    <Input
                      id="solicitante"
                      required
                      minLength={2}
                      maxLength={100}
                      placeholder="Nome completo"
                      value={dados.solicitante}
                      onChange={(event) => setDados({ ...dados, solicitante: event.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="local">Local</Label>
                    <Input
                      id="local"
                      required
                      minLength={2}
                      maxLength={120}
                      placeholder="Bloco, sala ou setor"
                      value={dados.local}
                      onChange={(event) => setDados({ ...dados, local: event.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Categoria</Label>
                    <Select
                      value={dados.categoria}
                      onValueChange={(categoria) => setDados({ ...dados, categoria })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Elétrica", "Hidráulica", "Climatização", "Estrutura", "Outros"].map(
                          (categoria) => (
                            <SelectItem key={categoria} value={categoria}>
                              {categoria}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Prioridade</Label>
                    <Select
                      value={dados.prioridade}
                      onValueChange={(prioridade) =>
                        setDados({ ...dados, prioridade: prioridade as Prioridade })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      required
                      minLength={10}
                      maxLength={1200}
                      placeholder="Informe quando começou, o que foi observado e se há risco imediato."
                      value={dados.descricao}
                      onChange={(event) => setDados({ ...dados, descricao: event.target.value })}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogAberto(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={salvando}>
                    {salvando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                    Registrar solicitação
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Visão operacional
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Chamados de manutenção
            </h1>
          </div>
          <p className="max-w-md text-base leading-7 text-muted-foreground">
            Registre problemas, acompanhe prioridades e confirme cada reparo em um só lugar.
          </p>
        </div>

        {erro && (
          <Alert variant="destructive" className="mb-5 bg-card">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>Não foi possível carregar os dados</AlertTitle>
            <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
              <span>{erro}</span>
              <Button variant="outline" size="sm" onClick={() => void carregarChamados()}>
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <article className="metric-card">
            <span className="metric-icon bg-amber-100 text-amber-800">
              <AlertTriangle aria-hidden="true" />
            </span>
            <div>
              <p className="metric-label">Abertos</p>
              <p className="metric-value">{String(totais.aberto).padStart(2, "0")}</p>
            </div>
          </article>
          <article className="metric-card">
            <span className="metric-icon bg-blue-100 text-blue-800">
              <Clock3 aria-hidden="true" />
            </span>
            <div>
              <p className="metric-label">Em atendimento</p>
              <p className="metric-value">{String(totais.em_atendimento).padStart(2, "0")}</p>
            </div>
          </article>
          <article className="metric-card">
            <span className="metric-icon bg-emerald-100 text-emerald-800">
              <CheckCircle2 aria-hidden="true" />
            </span>
            <div>
              <p className="metric-label">Concluídos</p>
              <p className="metric-value">{String(totais.concluido).padStart(2, "0")}</p>
            </div>
          </article>
        </div>

        <section className="mt-7 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Solicitações recentes</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Priorize o que precisa de atenção e acompanhe o andamento.
              </p>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <Select value={filtro} onValueChange={(value) => setFiltro(value as "todos" | Status)}>
                <SelectTrigger aria-label="Filtrar por status" className="w-full sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="aberto">Abertos</SelectItem>
                  <SelectItem value="em_atendimento">Em atendimento</SelectItem>
                  <SelectItem value="concluido">Concluídos</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label="Atualizar chamados"
                onClick={() => void carregarChamados()}
              >
                <RefreshCw className={carregando ? "animate-spin" : ""} aria-hidden="true" />
              </Button>
            </div>
          </div>

          {carregando ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-16 w-full" />
              ))}
            </div>
          ) : visiveis.length === 0 ? (
            <Empty className="border-0 py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Inbox aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>Nenhuma solicitação encontrada</EmptyTitle>
                <EmptyDescription>
                  Registre um problema de manutenção ou altere o filtro selecionado.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/60 hover:bg-muted/60">
                      <TableHead className="pl-6">Chamado</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead className="w-48 pr-6">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visiveis.map((chamado) => (
                      <TableRow key={chamado.id}>
                        <TableCell className="min-w-64 py-4 pl-6">
                          <p className="font-semibold">{chamado.titulo}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            CH-{String(chamado.id).padStart(4, "0")} · {humanDate(chamado.criadoEm)}
                          </p>
                        </TableCell>
                        <TableCell>{chamado.local}</TableCell>
                        <TableCell>{chamado.categoria}</TableCell>
                        <TableCell className={priorityClasses[chamado.prioridade]}>
                          {priorityLabel[chamado.prioridade]}
                        </TableCell>
                        <TableCell className="pr-6">
                          <Select
                            value={chamado.status}
                            onValueChange={(value) => void atualizarStatus(chamado, value as Status)}
                          >
                            <SelectTrigger aria-label={`Status de ${chamado.titulo}`} className="w-44">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="aberto">Aberto</SelectItem>
                              <SelectItem value="em_atendimento">Em atendimento</SelectItem>
                              <SelectItem value="concluido">Concluído</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="divide-y divide-border md:hidden">
                {visiveis.map((chamado) => (
                  <article key={chamado.id} className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold leading-6">{chamado.titulo}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          CH-{String(chamado.id).padStart(4, "0")}
                        </p>
                      </div>
                      <Badge variant="outline" className={statusClasses[chamado.status]}>
                        {statusLabel[chamado.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="size-4" aria-hidden="true" />
                      {chamado.local} · {chamado.categoria}
                    </div>
                    <Select
                      value={chamado.status}
                      onValueChange={(value) => void atualizarStatus(chamado, value as Status)}
                    >
                      <SelectTrigger aria-label={`Status de ${chamado.titulo}`} className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aberto">Aberto</SelectItem>
                        <SelectItem value="em_atendimento">Em atendimento</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
}

