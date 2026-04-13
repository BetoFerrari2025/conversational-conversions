import type { FunnelBlock } from "./BlockTypes";

export function BlockPreview({ block }: { block: FunnelBlock }) {
  const c = block.content;
  switch (block.type) {
    case "text":
      return <p className="text-sm text-muted-foreground truncate">{c.message || "Mensagem vazia..."}</p>;
    case "image":
      return c.url ? (
        <img src={c.url} alt={c.caption || "Imagem"} className="rounded max-h-16 object-cover" />
      ) : (
        <p className="text-sm text-muted-foreground">Sem imagem</p>
      );
    case "video":
      return <p className="text-sm text-muted-foreground truncate">{c.url ? "🎬 Vídeo carregado" : "Sem vídeo"}</p>;
    case "audio":
      return c.url ? (
        <audio src={c.url} controls className="h-8 w-full max-w-[200px]" />
      ) : (
        <p className="text-sm text-muted-foreground">Sem áudio</p>
      );
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
