import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowLeft, Save, Plus, Trash2, GripVertical,
  Type, Image, Video, MousePointerClick, FormInput, Clock, ChevronUp, ChevronDown
} from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface FunnelBlock {
  id: string;
  funnel_id: string;
  type: string;
  content: Record<string, any>;
  sort_order: number;
  position_x: number;
  position_y: number;
  next_block_id: string | null;
  created_at: string;
}

const BLOCK_TYPES = [
  { type: "text", label: "Texto", icon: Type, color: "text-blue-400" },
  { type: "image", label: "Imagem", icon: Image, color: "text-green-400" },
  { type: "video", label: "Vídeo", icon: Video, color: "text-purple-400" },
  { type: "buttons", label: "Botões", icon: MousePointerClick, color: "text-yellow-400" },
  { type: "input", label: "Input", icon: FormInput, color: "text-pink-400" },
  { type: "delay", label: "Delay", icon: Clock, color: "text-orange-400" },
];

const defaultContent: Record<string, Record<string, any>> = {
  text: { message: "" },
  image: { url: "", caption: "" },
  video: { url: "", caption: "" },
  buttons: { message: "", buttons: [{ label: "Opção 1", value: "1" }] },
  input: { placeholder: "Digite aqui...", variable: "resposta", inputType: "text" },
  delay: { seconds: 2 },
};

export default function FunnelBuilder() {
  const { funnelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [blocks, setBlocks] = useState<FunnelBlock[]>([]);
  const [funnelName, setFunnelName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingBlock, setEditingBlock] = useState<FunnelBlock | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    if (!user || !funnelId) return;
    const load = async () => {
      const { data: funnel } = await supabase.from("funnels").select("name").eq("id", funnelId).single();
      if (funnel) setFunnelName(funnel.name);

      const { data: blocksData } = await supabase
        .from("funnel_blocks")
        .select("*")
        .eq("funnel_id", funnelId)
        .order("sort_order", { ascending: true });

      setBlocks((blocksData ?? []).map(b => ({ ...b, content: (b.content as Record<string, any>) ?? {} })));
      setLoading(false);
    };
    load();
  }, [user, funnelId]);

  const addBlock = async (type: string) => {
    if (!funnelId) return;
    const sort_order = blocks.length;
    const content = defaultContent[type] ?? {};
    const { data, error } = await supabase
      .from("funnel_blocks")
      .insert({ funnel_id: funnelId, type, content: content as Json, sort_order })
      .select()
      .single();
    if (data) {
      setBlocks(prev => [...prev, { ...data, content: (data.content as Record<string, any>) ?? {} }]);
      toast({ title: `Bloco "${BLOCK_TYPES.find(b => b.type === type)?.label}" adicionado` });
    }
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
  };

  const deleteBlock = async (id: string) => {
    await supabase.from("funnel_blocks").delete().eq("id", id);
    setBlocks(prev => prev.filter(b => b.id !== id));
    toast({ title: "Bloco removido" });
  };

  const updateBlockContent = (id: string, content: Record<string, any>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    newBlocks.forEach((b, i) => b.sort_order = i);
    setBlocks(newBlocks);
  };

  const saveAll = async () => {
    setSaving(true);
    for (const block of blocks) {
      await supabase.from("funnel_blocks").update({
        content: block.content as Json,
        sort_order: block.sort_order,
      }).eq("id", block.id);
    }
    setSaving(false);
    toast({ title: "Funil salvo com sucesso!" });
  };

  const handleDragStart = (index: number) => { dragItem.current = index; };
  const handleDragEnter = (index: number) => { dragOverItem.current = index; };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const newBlocks = [...blocks];
    const draggedItem = newBlocks.splice(dragItem.current, 1)[0];
    newBlocks.splice(dragOverItem.current, 0, draggedItem);
    newBlocks.forEach((b, i) => b.sort_order = i);
    setBlocks(newBlocks);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const blockMeta = (type: string) => BLOCK_TYPES.find(b => b.type === type);

  if (loading) return <p className="text-muted-foreground p-6">Carregando builder...</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/funnels")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">{funnelName}</h1>
            <p className="text-sm text-muted-foreground">Editor de blocos do funil</p>
          </div>
        </div>
        <Button onClick={saveAll} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar - Block palette */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Adicionar Bloco</h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {BLOCK_TYPES.map(({ type, label, icon: Icon, color }) => (
              <Button
                key={type}
                variant="outline"
                className="justify-start h-auto py-3 px-4 hover:border-primary/50"
                onClick={() => addBlock(type)}
              >
                <Icon className={`mr-3 h-5 w-5 ${color}`} />
                <span>{label}</span>
                <Plus className="ml-auto h-4 w-4 text-muted-foreground" />
              </Button>
            ))}
          </div>
        </div>

        {/* Main canvas */}
        <div className="space-y-3">
          {blocks.length === 0 ? (
            <Card className="glass border-dashed border-2 border-border/50 flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground mb-2">Nenhum bloco adicionado</p>
              <p className="text-sm text-muted-foreground">Clique nos blocos ao lado para começar</p>
            </Card>
          ) : (
            blocks.map((block, index) => {
              const meta = blockMeta(block.type);
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <Card
                  key={block.id}
                  className="glass border-border/50 hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing"
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div className="flex items-start gap-3 p-4">
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-mono">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`h-4 w-4 ${meta.color}`} />
                        <span className="text-sm font-medium">{meta.label}</span>
                      </div>
                      <BlockPreview block={block} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveBlock(index, -1)} disabled={index === 0}>
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1}>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingBlock(block)}>
                        <FormInput className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteBlock(block.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editingBlock} onOpenChange={(open) => !open && setEditingBlock(null)}>
        <DialogContent className="glass max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Bloco - {blockMeta(editingBlock?.type ?? "")?.label}</DialogTitle>
          </DialogHeader>
          {editingBlock && (
            <BlockEditor
              block={editingBlock}
              onChange={(content) => {
                updateBlockContent(editingBlock.id, content);
                setEditingBlock({ ...editingBlock, content });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BlockPreview({ block }: { block: FunnelBlock }) {
  const c = block.content;
  switch (block.type) {
    case "text":
      return <p className="text-sm text-muted-foreground truncate">{c.message || "Mensagem vazia..."}</p>;
    case "image":
      return <p className="text-sm text-muted-foreground truncate">{c.url || "Sem URL"}{c.caption ? ` — ${c.caption}` : ""}</p>;
    case "video":
      return <p className="text-sm text-muted-foreground truncate">{c.url || "Sem URL"}</p>;
    case "buttons":
      return (
        <div className="flex flex-wrap gap-1">
          {(c.buttons ?? []).map((btn: any, i: number) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">{btn.label}</span>
          ))}
        </div>
      );
    case "input":
      return <p className="text-sm text-muted-foreground">Variável: {c.variable || "resposta"} ({c.inputType || "text"})</p>;
    case "delay":
      return <p className="text-sm text-muted-foreground">{c.seconds || 0}s de espera</p>;
    default:
      return null;
  }
}

function BlockEditor({ block, onChange }: { block: FunnelBlock; onChange: (content: Record<string, any>) => void }) {
  const c = block.content;
  const update = (key: string, value: any) => onChange({ ...c, [key]: value });

  switch (block.type) {
    case "text":
      return (
        <div className="space-y-3">
          <Label>Mensagem</Label>
          <Textarea value={c.message ?? ""} onChange={(e) => update("message", e.target.value)} placeholder="Digite a mensagem..." rows={4} />
          <p className="text-xs text-muted-foreground">Use {"{{nome}}"} para variáveis</p>
        </div>
      );
    case "image":
      return (
        <div className="space-y-3">
          <Label>URL da Imagem</Label>
          <Input value={c.url ?? ""} onChange={(e) => update("url", e.target.value)} placeholder="https://..." />
          <Label>Legenda (opcional)</Label>
          <Input value={c.caption ?? ""} onChange={(e) => update("caption", e.target.value)} placeholder="Legenda" />
        </div>
      );
    case "video":
      return (
        <div className="space-y-3">
          <Label>URL do Vídeo</Label>
          <Input value={c.url ?? ""} onChange={(e) => update("url", e.target.value)} placeholder="https://youtube.com/..." />
          <Label>Legenda (opcional)</Label>
          <Input value={c.caption ?? ""} onChange={(e) => update("caption", e.target.value)} placeholder="Legenda" />
        </div>
      );
    case "buttons":
      return (
        <div className="space-y-3">
          <Label>Mensagem acima dos botões</Label>
          <Textarea value={c.message ?? ""} onChange={(e) => update("message", e.target.value)} placeholder="Escolha uma opção:" rows={2} />
          <Label>Botões</Label>
          {(c.buttons ?? []).map((btn: any, i: number) => (
            <div key={i} className="flex gap-2">
              <Input
                value={btn.label}
                onChange={(e) => {
                  const newBtns = [...(c.buttons ?? [])];
                  newBtns[i] = { ...newBtns[i], label: e.target.value };
                  update("buttons", newBtns);
                }}
                placeholder={`Botão ${i + 1}`}
              />
              <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => {
                const newBtns = (c.buttons ?? []).filter((_: any, j: number) => j !== i);
                update("buttons", newBtns);
              }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => {
            const newBtns = [...(c.buttons ?? []), { label: `Opção ${(c.buttons?.length ?? 0) + 1}`, value: String((c.buttons?.length ?? 0) + 1) }];
            update("buttons", newBtns);
          }}>
            <Plus className="mr-1 h-3 w-3" />Adicionar Botão
          </Button>
        </div>
      );
    case "input":
      return (
        <div className="space-y-3">
          <Label>Nome da Variável</Label>
          <Input value={c.variable ?? ""} onChange={(e) => update("variable", e.target.value)} placeholder="nome" />
          <Label>Placeholder</Label>
          <Input value={c.placeholder ?? ""} onChange={(e) => update("placeholder", e.target.value)} placeholder="Digite aqui..." />
          <Label>Tipo</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={c.inputType ?? "text"} onChange={(e) => update("inputType", e.target.value)}>
            <option value="text">Texto</option>
            <option value="email">Email</option>
            <option value="phone">Telefone</option>
            <option value="number">Número</option>
          </select>
        </div>
      );
    case "delay":
      return (
        <div className="space-y-3">
          <Label>Tempo de espera (segundos)</Label>
          <Input type="number" min={1} max={30} value={c.seconds ?? 2} onChange={(e) => update("seconds", Number(e.target.value))} />
        </div>
      );
    default:
      return <p className="text-muted-foreground">Tipo de bloco desconhecido</p>;
  }
}
