import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowLeft, Save, Plus, Trash2, GripVertical,
  ChevronUp, ChevronDown, Pencil, Eye, Globe, Copy
} from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import { BLOCK_TYPES, defaultContent, type FunnelBlock } from "@/components/funnel-builder/BlockTypes";
import { BlockPreview } from "@/components/funnel-builder/BlockPreview";
import { BlockEditor } from "@/components/funnel-builder/BlockEditor";
import { FunnelTemplates } from "@/components/funnel-builder/FunnelTemplates";
import { MediaUpload } from "@/components/funnel-builder/MediaUpload";

export default function FunnelBuilder() {
  const { funnelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [blocks, setBlocks] = useState<FunnelBlock[]>([]);
  const [funnelName, setFunnelName] = useState("");
  const [funnelSlug, setFunnelSlug] = useState("");
  const [funnelStatus, setFunnelStatus] = useState("draft");
  const [attendantPhoto, setAttendantPhoto] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingBlock, setEditingBlock] = useState<FunnelBlock | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    if (!user || !funnelId) return;
    const load = async () => {
      const { data: funnel } = await supabase.from("funnels").select("name, slug, status, attendant_photo_url").eq("id", funnelId).single();
      if (funnel) {
        setFunnelName(funnel.name);
        setFunnelSlug(funnel.slug);
        setFunnelStatus(funnel.status);
        setAttendantPhoto(funnel.attendant_photo_url ?? "");
      }
      const { data: blocksData } = await supabase
        .from("funnel_blocks").select("*").eq("funnel_id", funnelId)
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
      .select().single();
    if (data) {
      const newBlock = { ...data, content: (data.content as Record<string, any>) ?? {} };
      setBlocks(prev => [...prev, newBlock]);
      setEditingBlock(newBlock);
    }
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
  };

  const deleteBlock = async (id: string) => {
    await supabase.from("funnel_blocks").delete().eq("id", id);
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (editingBlock?.id === id) setEditingBlock(null);
    toast({ title: "Bloco removido" });
  };

  const updateBlockContent = (id: string, content: Record<string, any>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
    if (editingBlock?.id === id) {
      setEditingBlock(prev => prev ? { ...prev, content } : null);
    }
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
    // Save funnel meta
    await supabase.from("funnels").update({
      name: funnelName,
      status: funnelStatus,
      attendant_photo_url: attendantPhoto || null,
    }).eq("id", funnelId);
    setSaving(false);
    toast({ title: "Funil salvo com sucesso!" });
  };

  const toggleStatus = async () => {
    const newStatus = funnelStatus === "published" ? "draft" : "published";
    setFunnelStatus(newStatus);
    await supabase.from("funnels").update({ status: newStatus }).eq("id", funnelId);
    toast({ title: newStatus === "published" ? "Funil publicado!" : "Funil despublicado" });
  };

  const saveName = async () => {
    if (!tempName.trim()) return;
    setFunnelName(tempName);
    setEditingName(false);
    await supabase.from("funnels").update({ name: tempName }).eq("id", funnelId);
    toast({ title: "Nome atualizado!" });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/f/${funnelSlug}`);
    toast({ title: "Link copiado!" });
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

  const applyTemplate = async (templateBlocks: Array<{ type: string; content: Record<string, any> }>) => {
    if (!funnelId) return;
    for (const b of blocks) {
      await supabase.from("funnel_blocks").delete().eq("id", b.id);
    }
    const newBlocks: FunnelBlock[] = [];
    for (let i = 0; i < templateBlocks.length; i++) {
      const { type, content } = templateBlocks[i];
      const { data } = await supabase.from("funnel_blocks")
        .insert({ funnel_id: funnelId, type, content: content as Json, sort_order: i })
        .select().single();
      if (data) newBlocks.push({ ...data, content: (data.content as Record<string, any>) ?? {} });
    }
    setBlocks(newBlocks);
    toast({ title: "Template aplicado!" });
  };

  const blockMeta = (type: string) => BLOCK_TYPES.find(b => b.type === type);

  if (loading) return <p className="text-muted-foreground p-6">Carregando builder...</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/funnels")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input value={tempName} onChange={e => setTempName(e.target.value)} className="h-8 w-60"
                  onKeyDown={e => e.key === "Enter" && saveName()} autoFocus />
                <Button size="sm" onClick={saveName}>OK</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>Cancelar</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-heading font-bold text-foreground">{funnelName}</h1>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setTempName(funnelName); setEditingName(true); }}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Badge className={funnelStatus === "published" ? "bg-primary/20 text-primary" : "bg-secondary text-secondary-foreground"}>
                  {funnelStatus === "published" ? "Publicado" : "Rascunho"}
                </Badge>
              </div>
            )}
            <p className="text-sm text-muted-foreground">Editor de blocos do funil</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <Label htmlFor="publish-toggle" className="text-sm">Publicar</Label>
            <Switch id="publish-toggle" checked={funnelStatus === "published"} onCheckedChange={toggleStatus} />
          </div>
          {funnelStatus === "published" && (
            <Button variant="outline" size="sm" onClick={copyLink}>
              <Copy className="mr-1 h-3 w-3" />Link
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
            <Eye className="mr-1 h-3 w-3" />Preview
          </Button>
          <Button onClick={saveAll} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />{saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar */}
        <div className="space-y-3">
          {/* Attendant photo */}
          <div className="space-y-2 p-3 rounded-lg border border-border/50 bg-card">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Foto do Atendente</Label>
            <MediaUpload
              label=""
              accept="image/*"
              currentUrl={attendantPhoto}
              onUploaded={setAttendantPhoto}
              preview="image"
            />
          </div>

          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Adicionar Bloco</h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {BLOCK_TYPES.map(({ type, label, icon: Icon, color }) => (
              <Button key={type} variant="outline" className="justify-start h-auto py-3 px-4 hover:border-primary/50"
                onClick={() => addBlock(type)}>
                <Icon className={`mr-3 h-5 w-5 ${color}`} />
                <span>{label}</span>
                <Plus className="ml-auto h-4 w-4 text-muted-foreground" />
              </Button>
            ))}
          </div>
          <FunnelTemplates onSelect={applyTemplate} />
        </div>

        {/* Blocks */}
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
                <Card key={block.id} className="glass border-border/50 hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing"
                  draggable onDragStart={() => handleDragStart(index)} onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()}>
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
                        <Pencil className="h-3 w-3" />
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

      {/* Block Editor Dialog */}
      {editingBlock && (
        <Dialog open onOpenChange={(open) => { if (!open) setEditingBlock(null); }}>
          <DialogContent className="glass max-w-lg" aria-describedby="edit-block-desc">
            <DialogHeader>
              <DialogTitle>Editar Bloco - {blockMeta(editingBlock.type)?.label}</DialogTitle>
              <p id="edit-block-desc" className="text-sm text-muted-foreground">Edite o conteúdo do bloco abaixo</p>
            </DialogHeader>
            <BlockEditor
              block={editingBlock}
              onChange={(content) => updateBlockContent(editingBlock.id, content)}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditingBlock(null)}>Cancelar</Button>
              <Button onClick={async () => { await saveAll(); setEditingBlock(null); }}>
                <Save className="mr-2 h-4 w-4" />Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-sm p-0 overflow-hidden rounded-2xl h-[600px] flex flex-col" aria-describedby="preview-desc">
          <span id="preview-desc" className="sr-only">Pré-visualização do funil</span>
          <div className="bg-[#1f2c34] px-4 py-3 flex items-center gap-3">
            {attendantPhoto ? (
              <img src={attendantPhoto} alt="Atendente" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">Z</div>
            )}
            <div>
              <p className="text-white font-medium text-sm">{funnelName}</p>
              <p className="text-[#8696a0] text-xs">online</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-[#0b141a] px-3 py-4 space-y-2">
            {blocks.map((block, i) => {
              if (block.type === "delay") return (
                <p key={i} className="text-center text-[#8696a0] text-xs">⏱ {block.content.seconds || 0}s de espera</p>
              );
              return (
                <div key={i} className="flex justify-start">
                  <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-[#1f2c34] text-[#e9edef] rounded-bl-none">
                    <PreviewBlockContent block={block} />
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PreviewBlockContent({ block }: { block: FunnelBlock }) {
  const c = block.content;
  switch (block.type) {
    case "text": return <p className="whitespace-pre-wrap">{c.message || "..."}</p>;
    case "image": return c.url ? <img src={c.url} alt="" className="rounded max-w-full" /> : <p>📷 Imagem</p>;
    case "video": return c.url ? <video src={c.url} controls className="rounded max-w-full" /> : <p>🎬 Vídeo</p>;
    case "audio": return c.url ? <audio src={c.url} controls className="w-full" /> : <p>🔊 Áudio</p>;
    case "buttons": return (
      <div>
        {c.message && <p className="mb-2">{c.message}</p>}
        <div className="flex flex-col gap-1">
          {(c.buttons ?? []).map((btn: any, i: number) => (
            <span key={i} className="px-3 py-1.5 rounded bg-[#2a3942] text-[#00a884] text-sm">{btn.label}</span>
          ))}
        </div>
      </div>
    );
    case "input": return <p>💬 {c.placeholder || "Aguardando resposta..."}</p>;
    default: return null;
  }
}
