import type { FunnelBlock } from "./BlockTypes";
import type { LandingPageSettings } from "./LandingPageEditor";

interface LivePhonePreviewProps {
  blocks: FunnelBlock[];
  funnelName: string;
  attendantPhoto: string;
  appearance: {
    bgColor: string;
    balloonColor: string;
    chatStyle: string;
    messageFieldText: string;
    friendshipText: string;
  };
  landingPage: LandingPageSettings;
  previewMode: "landing" | "chat";
  onTogglePreview: (mode: "landing" | "chat") => void;
}

export function LivePhonePreview({
  blocks, funnelName, attendantPhoto, appearance, landingPage,
  previewMode, onTogglePreview,
}: LivePhonePreviewProps) {
  const style = appearance.chatStyle;

  const headerBg =
    style === "messenger" ? "#0084ff" :
    style === "direct" ? "#262626" :
    style === "default" ? "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))" :
    "#1f2c34"; // whatsapp

  const bubbleRadius =
    style === "messenger" ? "rounded-2xl rounded-bl-md" :
    style === "direct" ? "rounded-3xl rounded-bl-sm" :
    style === "default" ? "rounded-xl rounded-bl-none" :
    "rounded-lg rounded-bl-none"; // whatsapp

  const buttonBubbleColor =
    style === "messenger" ? "#0084ff" :
    style === "direct" ? "#3a3a3a" :
    style === "default" ? "hsl(var(--primary))" :
    "#00a884";

  const showLanding = landingPage.enabled && previewMode === "landing";

  return (
    <div className="flex flex-col items-center gap-3 sticky top-4">
      {/* Mode toggle */}
      {landingPage.enabled && (
        <div className="flex gap-1 bg-card rounded-lg p-1 border border-border/50">
          <button
            onClick={() => onTogglePreview("landing")}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              previewMode === "landing" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            Landing Page
          </button>
          <button
            onClick={() => onTogglePreview("chat")}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              previewMode === "chat" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            Chat
          </button>
        </div>
      )}

      {/* Phone frame */}
      <div className="w-[320px] h-[580px] rounded-[2rem] border-4 border-border/80 bg-black overflow-hidden shadow-2xl flex flex-col">
        {showLanding ? (
          /* Landing Page Preview */
          <div className="flex-1 flex flex-col" style={{ backgroundColor: landingPage.bgColor }}>
            {landingPage.heroImageUrl ? (
              <div className="flex-1 relative">
                <img
                  src={landingPage.heroImageUrl}
                  alt="Hero"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-center">
                  {landingPage.title && (
                    <h2 className="text-white font-bold text-lg mb-1">{landingPage.title}</h2>
                  )}
                  {landingPage.subtitle && (
                    <p className="text-white/70 text-xs mb-4">{landingPage.subtitle}</p>
                  )}
                  <button className="w-full py-3 rounded-lg bg-white text-black font-semibold text-sm">
                    {landingPage.ctaText || "Iniciar Conversa"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                {landingPage.title && (
                  <h2 className="text-white font-bold text-xl mb-2">{landingPage.title}</h2>
                )}
                {landingPage.subtitle && (
                  <p className="text-white/60 text-sm mb-6">{landingPage.subtitle}</p>
                )}
                <button className="w-full py-3 rounded-lg bg-white text-black font-semibold text-sm">
                  {landingPage.ctaText || "Iniciar Conversa"}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Chat Preview */
          <>
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: headerBg }}>
              {attendantPhoto ? (
                <img src={attendantPhoto} alt="" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                  {funnelName?.[0]?.toUpperCase() || "Z"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{funnelName || "Meu Funil"}</p>
                <p className="text-white/60 text-xs">
                  {appearance.friendshipText || "online"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-3 py-3 space-y-2"
              style={{ backgroundColor: appearance.bgColor }}
            >
              {blocks.length === 0 ? (
                <p className="text-center text-white/30 text-xs mt-8">
                  Adicione blocos para ver o preview
                </p>
              ) : (
                blocks.map((block, i) => {
                  if (block.type === "delay") {
                    return (
                      <p key={i} className="text-center text-white/40 text-[10px] py-1">
                        ⏱ {block.content.seconds || 0}s
                      </p>
                    );
                  }
                  return (
                    <div key={i} className="flex justify-start">
                      <div
                        className="max-w-[85%] rounded-lg px-3 py-2 text-[13px] text-white rounded-bl-none"
                        style={{ backgroundColor: appearance.balloonColor }}
                      >
                        <ChatBubbleContent block={block} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input bar */}
            <div className="px-3 py-2 flex items-center gap-2" style={{ backgroundColor: appearance.bgColor }}>
              <div className="flex-1 rounded-full px-4 py-2 text-xs text-white/40" style={{ backgroundColor: appearance.balloonColor }}>
                {appearance.messageFieldText || "Digite uma mensagem"}
              </div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs">▶</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ChatBubbleContent({ block }: { block: FunnelBlock }) {
  const c = block.content;
  switch (block.type) {
    case "text":
      return <p className="whitespace-pre-wrap">{c.message || "..."}</p>;
    case "image":
      return c.url ? <img src={c.url} alt="" className="rounded max-w-full" /> : <p>📷 Imagem</p>;
    case "video":
      return c.url ? <video src={c.url} controls className="rounded max-w-full" /> : <p>🎬 Vídeo</p>;
    case "audio":
      return c.url ? <audio src={c.url} controls className="w-full" /> : <p>🔊 Áudio</p>;
    case "buttons":
      return (
        <div>
          {c.message && <p className="mb-2">{c.message}</p>}
          <div className="flex flex-col gap-1">
            {(c.buttons ?? []).map((btn: any, i: number) => (
              <span key={i} className="px-3 py-1.5 rounded bg-white/10 text-[#00a884] text-xs text-center">
                {btn.label}
              </span>
            ))}
          </div>
        </div>
      );
    case "input":
      return <p className="text-white/60">💬 {c.placeholder || "Aguardando resposta..."}</p>;
    default:
      return null;
  }
}
