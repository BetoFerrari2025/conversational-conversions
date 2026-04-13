import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowLeft, Save, Plus, Trash2, GripVertical,
  ChevronUp, ChevronDown, Pencil
} from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import { BLOCK_TYPES, defaultContent, type FunnelBlock } from "@/components/funnel-builder/BlockTypes";
import { BlockPreview } from "@/components/funnel-builder/BlockPreview";
import { BlockEditor } from "@/components/funnel-builder/BlockEditor";
import { FunnelTemplates } from "@/components/funnel-builder/FunnelTemplates";

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
      const newBlock = { ...data, content: (data.content as Record<string, any>) ?? {} };
      setBlocks(prev => [...prev, newBlock]);
      setEditingBlock(newBlock);
      toast({ title: `Bloco "${BLOCK_TYPES.find(b => b.type === type)?.label}" adicionado` });
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

  const applyTemplate = async (templateBlocks: Array<{ type: string; content: Record<string, any> }>) => {
    if (!funnelId) return;
    // Delete existing blocks
    for (const b of blocks) {
      await supabase.from("funnel_blocks").delete().eq("id", b.id);
    }
    const newBlocks: FunnelBlock[] = [];
    for (let i = 0; i < templateBlocks.length; i++) {
      const { type, content } = templateBlocks[i];
      const { data } = await supabase
        .from("funnel_blocks")
        .insert({ funnel_id: funnelId, type, content: content as Json, sort_order: i })
        .select()
        .single();
      if (data) newBlocks.push({ ...data, content: (data.content as Record<string, any>) ?? {} });
    }
    setBlocks(newBlocks);
    toast({ title: "Template aplicado com sucesso!" });
  };

  const blockMeta = (type: string) => BLOCK_TYPES.find(b => b.type === type);

  if (loading) return <p className="text-muted-foreground p-6">Carregando builder...</p>;

  return (
    <div className="space-y-6">
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
          <FunnelTemplates onSelect={applyTemplate} />
        </div>

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
