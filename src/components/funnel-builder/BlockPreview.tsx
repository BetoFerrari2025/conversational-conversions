import type { FunnelBlock } from "./BlockTypes";

export function BlockPreview({ block }: { block: FunnelBlock }) {
  const c = block.content;
  switch (block.type) {
    case "text":
      return <p className="text-sm text-muted-foreground truncate">{c.message || "Mensagem vazia..."}</p>;
    case "image":
      return <p className="text-sm text-muted-foreground truncate">{c.url ? "🖼 Imagem carregada" : "Sem imagem"}</p>;
    case "video":
      return <p className="text-sm text-muted-foreground truncate">{c.url ? "🎬 Vídeo carregado" : "Sem vídeo"}</p>;
    case "audio":
      return <p className="text-sm text-muted-foreground truncate">{c.url ? "🔊 Áudio carregado" : "Sem áudio"}</p>;
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
