import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Save, Plus, Trash2, GripVertical,
  ChevronUp, ChevronDown, Pencil, Copy, Settings, Palette, FileText
} from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import { BLOCK_TYPES, defaultContent, type FunnelBlock } from "@/components/funnel-builder/BlockTypes";
import { BlockEditor } from "@/components/funnel-builder/BlockEditor";
import { BlockPreview } from "@/components/funnel-builder/BlockPreview";
import { FunnelTemplates } from "@/components/funnel-builder/FunnelTemplates";
import { MediaUpload } from "@/components/funnel-builder/MediaUpload";
import { AppearanceSettings } from "@/components/funnel-builder/AppearanceSettings";
import { LandingPageEditor, type LandingPageSettings } from "@/components/funnel-builder/LandingPageEditor";
import { LivePhonePreview } from "@/components/funnel-builder/LivePhonePreview";

const DEFAULT_APPEARANCE = {
  bgColor: "#0b141a",
  balloonColor: "#1f2c34",
  chatStyle: "whatsapp",
  messageFieldText: "Digite uma mensagem",
  friendshipText: "",
};

const DEFAULT_LANDING: LandingPageSettings = {
  enabled: false,
  bgColor: "#000000",
  heroImageUrl: "",
  title: "",
  subtitle: "",
  ctaText: "Iniciar Conversa",
};

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
  const [appearance, setAppearance] = useState(DEFAULT_APPEARANCE);
  const [landingPage, setLandingPage] = useState<LandingPageSettings>(DEFAULT_LANDING);
  const [previewMode, setPreviewMode] = useState<"landing" | "chat">("chat");

  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState("elements");

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    if (!user || !funnelId) return;
    const load = async () => {
      const { data: funnel } = await supabase
        .from("funnels").select("name, slug, status, attendant_photo_url, settings")
        .eq("id", funnelId).single();
      if (funnel) {
        setFunnelName(funnel.name);
        setFunnelSlug(funnel.slug);
        setFunnelStatus(funnel.status);
        setAttendantPhoto(funnel.attendant_photo_url ?? "");
        const s = (funnel.settings as Record<string, any>) ?? {};
        if (s.appearance) setAppearance({ ...DEFAULT_APPEARANCE, ...s.appearance });
        if (s.landingPage) setLandingPage({ ...DEFAULT_LANDING, ...s.landingPage });
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
      setExpandedBlock(newBlock.id);
    }
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
  };

  const deleteBlock = async (id: string) => {
    await supabase.from("funnel_blocks").delete().eq("id", id);
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (expandedBlock === id) setExpandedBlock(null);
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
    await supabase.from("funnels").update({
      name: funnelName,
      status: funnelStatus,
      attendant_photo_url: attendantPhoto || null,
      settings: { appearance, landingPage } as unknown as Json,
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
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/f/${funnelSlug}`);
    toast({ title: "Link copiado!" });
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
    <div className="h-full flex flex-col gap-0">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-card/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/dashboard/funnels")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input value={tempName} onChange={e => setTempName(e.target.value)} className="h-7 w-48 text-sm"
                onKeyDown={e => e.key === "Enter" && saveName()} autoFocus />
              <Button size="sm" className="h-7 text-xs" onClick={saveName}>OK</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingName(false)}>✕</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-foreground">{funnelName}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setTempName(funnelName); setEditingName(true); }}>
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
          )}
          <Badge className={funnelStatus === "published" ? "bg-primary/20 text-primary" : "bg-secondary text-secondary-foreground"}>
            {funnelStatus === "published" ? "Publicado" : "Rascunho"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <Label htmlFor="pub-toggle" className="text-xs">Publicar</Label>
            <Switch id="pub-toggle" checked={funnelStatus === "published"} onCheckedChange={toggleStatus} />
          </div>
          {funnelStatus === "published" && (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={copyLink}>
              <Copy className="mr-1 h-3 w-3" />Link
            </Button>
          )}
          <FunnelTemplates onSelect={applyTemplate} />
          <Button onClick={saveAll} disabled={saving} className="h-8">
            <Save className="mr-1 h-3.5 w-3.5" />{saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <div className="w-[260px] border-r border-border/50 bg-card/30 overflow-y-auto flex-shrink-0">
          <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="h-full flex flex-col">
            <TabsList className="w-full rounded-none border-b border-border/50 bg-transparent h-10 flex-shrink-0">
              <TabsTrigger value="elements" className="flex-1 text-xs data-[state=active]:bg-primary/10">
                <Plus className="h-3 w-3 mr-1" />Elementos
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex-1 text-xs data-[state=active]:bg-primary/10">
                <Palette className="h-3 w-3 mr-1" />Aparência
              </TabsTrigger>
              <TabsTrigger value="config" className="flex-1 text-xs data-[state=active]:bg-primary/10">
                <Settings className="h-3 w-3 mr-1" />Config
              </TabsTrigger>
            </TabsList>

            <TabsContent value="elements" className="flex-1 overflow-y-auto p-3 space-y-2 mt-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
                Clique ou arraste para adicionar
              </p>
              {BLOCK_TYPES.map(({ type, label, icon: Icon, color }) => (
                <button
                  key={type}
                  onClick={() => addBlock(type)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                >
                  <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
                  <span className="text-sm text-foreground">{label}</span>
                  <Plus className="ml-auto h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </TabsContent>

            <TabsContent value="appearance" className="flex-1 overflow-y-auto p-3 mt-0">
              <AppearanceSettings settings={appearance} onChange={setAppearance} />
            </TabsContent>

            <TabsContent value="config" className="flex-1 overflow-y-auto p-3 space-y-4 mt-0">
              <div className="space-y-2 p-3 rounded-lg border border-border/50 bg-card">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Foto do Atendente</Label>
                <MediaUpload
                  label=""
                  accept="image/*"
                  currentUrl={attendantPhoto}
                  onUploaded={setAttendantPhoto}
                  preview="image"
                />
              </div>
              <LandingPageEditor settings={landingPage} onChange={setLandingPage} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Center: block list with inline editors */}
        <div className="flex-1 overflow-y-auto bg-background p-4">
          <div className="max-w-xl mx-auto space-y-2">
            {blocks.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nenhum bloco adicionado</p>
                <p className="text-sm mt-1">Clique nos elementos à esquerda para começar</p>
              </div>
            ) : (
              blocks.map((block, index) => {
                const meta = blockMeta(block.type);
                if (!meta) return null;
                const Icon = meta.icon;
                const isExpanded = expandedBlock === block.id;

                return (
                  <div
                    key={block.id}
                    className={`rounded-lg border transition-all ${
                      isExpanded ? "border-primary/50 bg-card shadow-lg" : "border-border/30 bg-card/50 hover:border-border"
                    }`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {/* Block header */}
                    <div
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer"
                      onClick={() => setExpandedBlock(isExpanded ? null : block.id)}
                    >
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground cursor-grab flex-shrink-0" />
                      <span className="text-xs text-muted-foreground font-mono w-5">{index + 1}.</span>
                      <Icon className={`h-4 w-4 ${meta.color} flex-shrink-0`} />
                      <span className="text-sm font-medium flex-shrink-0">{meta.label}</span>
                      <div className="flex-1 min-w-0 ml-2">
                        {!isExpanded && <BlockPreview block={block} />}
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveBlock(index, -1); }} disabled={index === 0}>
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveBlock(index, 1); }} disabled={index === blocks.length - 1}>
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Inline editor */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-border/30">
                        <BlockEditor
                          block={block}
                          onChange={(content) => updateBlockContent(block.id, content)}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: live phone preview */}
        <div className="w-[360px] border-l border-border/50 bg-card/20 overflow-y-auto flex-shrink-0 flex items-start justify-center py-6">
          <LivePhonePreview
            blocks={blocks}
            funnelName={funnelName}
            attendantPhoto={attendantPhoto}
            appearance={appearance}
            landingPage={landingPage}
            previewMode={previewMode}
            onTogglePreview={setPreviewMode}
          />
        </div>
      </div>
    </div>
  );
}
