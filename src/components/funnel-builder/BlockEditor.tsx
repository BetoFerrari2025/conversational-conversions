import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { MediaUpload } from "./MediaUpload";
import type { FunnelBlock } from "./BlockTypes";

interface BlockEditorProps {
  block: FunnelBlock;
  onChange: (content: Record<string, any>) => void;
}

export function BlockEditor({ block, onChange }: BlockEditorProps) {
  const c = block.content;
  const update = (key: string, value: any) => onChange({ ...c, [key]: value });

  switch (block.type) {
    case "text":
      return (
        <div className="space-y-3">
          <Label>Mensagem</Label>
          <Textarea
            value={c.message ?? ""}
            onChange={(e) => update("message", e.target.value)}
            placeholder="Digite a mensagem..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">Use {"{{nome}}"} para variáveis</p>
        </div>
      );
    case "image":
      return (
        <div className="space-y-3">
          <MediaUpload
            label="Imagem"
            accept="image/*"
            currentUrl={c.url ?? ""}
            onUploaded={(url) => update("url", url)}
            preview="image"
          />
          <Label>Legenda (opcional)</Label>
          <Input value={c.caption ?? ""} onChange={(e) => update("caption", e.target.value)} placeholder="Legenda" />
        </div>
      );
    case "video":
      return (
        <div className="space-y-3">
          <MediaUpload
            label="Vídeo"
            accept="video/*"
            currentUrl={c.url ?? ""}
            onUploaded={(url) => update("url", url)}
            preview="video"
          />
          <Label>Legenda (opcional)</Label>
          <Input value={c.caption ?? ""} onChange={(e) => update("caption", e.target.value)} placeholder="Legenda" />
        </div>
      );
    case "audio":
      return (
        <div className="space-y-3">
          <MediaUpload
            label="Áudio"
            accept="audio/*"
            currentUrl={c.url ?? ""}
            onUploaded={(url) => update("url", url)}
            preview="audio"
          />
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
                update("buttons", (c.buttons ?? []).filter((_: any, j: number) => j !== i));
              }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => {
            update("buttons", [...(c.buttons ?? []), { label: `Opção ${(c.buttons?.length ?? 0) + 1}`, value: String((c.buttons?.length ?? 0) + 1) }]);
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
