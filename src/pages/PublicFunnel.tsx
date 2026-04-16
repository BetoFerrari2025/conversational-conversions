import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, CheckCheck } from "lucide-react";

interface FunnelBlock {
  id: string;
  type: string;
  content: Record<string, any>;
  sort_order: number;
}

interface Appearance {
  bgColor: string;
  balloonColor: string;
  chatStyle: string;
  messageFieldText: string;
  friendshipText: string;
}

interface LandingPage {
  enabled: boolean;
  bgColor: string;
  heroImageUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
}

const DEFAULT_APPEARANCE: Appearance = {
  bgColor: "#0b141a",
  balloonColor: "#1f2c34",
  chatStyle: "whatsapp",
  messageFieldText: "Digite uma mensagem",
  friendshipText: "online",
};

const DEFAULT_LANDING: LandingPage = {
  enabled: false,
  bgColor: "#000000",
  heroImageUrl: "",
  title: "",
  subtitle: "",
  ctaText: "Iniciar Conversa",
};

export default function PublicFunnel() {
  const { slug } = useParams();
  const [blocks, setBlocks] = useState<FunnelBlock[]>([]);
  const [funnelName, setFunnelName] = useState("");
  const [funnelId, setFunnelId] = useState("");
  const [attendantPhoto, setAttendantPhoto] = useState("");
  const [appearance, setAppearance] = useState<Appearance>(DEFAULT_APPEARANCE);
  const [landingPage, setLandingPage] = useState<LandingPage>(DEFAULT_LANDING);
  const [showLanding, setShowLanding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<Array<{ type: "bot" | "user"; content: any; blockType?: string }>>([]);
  const [inputValue, setInputValue] = useState("");
  const [typing, setTyping] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [notFound, setNotFound] = useState(false);
  const [unpublished, setUnpublished] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const processedRef = useRef(0);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      const { data: funnel } = await supabase
        .from("funnels").select("id, name, status, attendant_photo_url, settings").eq("slug", slug).single();
      if (!funnel) { setNotFound(true); return; }
      if (funnel.status !== "published") { setUnpublished(true); return; }
      setFunnelName(funnel.name);
      setFunnelId(funnel.id);
      setAttendantPhoto(funnel.attendant_photo_url ?? "");
      const s = (funnel.settings as Record<string, any>) ?? {};
      const ap = { ...DEFAULT_APPEARANCE, ...(s.appearance ?? {}) };
      const lp = { ...DEFAULT_LANDING, ...(s.landingPage ?? {}) };
      setAppearance(ap);
      setLandingPage(lp);
      setShowLanding(lp.enabled);

      const { data: blocksData } = await supabase
        .from("funnel_blocks").select("*").eq("funnel_id", funnel.id)
        .order("sort_order", { ascending: true });
      setBlocks((blocksData ?? []).map(b => ({ ...b, content: (b.content as Record<string, any>) ?? {} })));

      // Track visit
      await supabase.from("funnel_visits").insert({
        funnel_id: funnel.id,
        visitor_id: crypto.randomUUID(),
      });
    };
    load();
  }, [slug]);

  useEffect(() => {
    if (showLanding || blocks.length === 0 || processedRef.current >= blocks.length) return;
    processNextBlock();
  }, [blocks, currentStep, showLanding]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const replaceVars = (text: string) =>
    text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`);

  const processNextBlock = async () => {
    if (currentStep >= blocks.length) {
      if (funnelId && Object.keys(variables).length > 0) {
        await supabase.from("leads").insert({
          funnel_id: funnelId,
          name: variables.nome || variables.name || null,
          email: variables.email || null,
          phone: variables.phone || variables.telefone || null,
          data: variables as any,
          source: "funnel",
        });
      }
      return;
    }
    const block = blocks[currentStep];
    processedRef.current = currentStep + 1;
    if (block.type === "delay") {
      setTyping(true);
      await new Promise(r => setTimeout(r, (block.content.seconds || 2) * 1000));
      setTyping(false);
      setCurrentStep(prev => prev + 1);
      return;
    }
    if (block.type === "input" || block.type === "buttons") {
      setTyping(true);
      await new Promise(r => setTimeout(r, 800));
      setTyping(false);
      setMessages(prev => [...prev, { type: "bot", content: block.content, blockType: block.type }]);
      return;
    }
    setTyping(true);
    await new Promise(r => setTimeout(r, 800));
    setTyping(false);
    setMessages(prev => [...prev, { type: "bot", content: block.content, blockType: block.type }]);
    setCurrentStep(prev => prev + 1);
  };

  const handleSendInput = () => {
    if (!inputValue.trim()) return;
    const block = blocks[currentStep];
    const varName = block?.content?.variable || "resposta";
    setVariables(prev => ({ ...prev, [varName]: inputValue }));
    setMessages(prev => [...prev, { type: "user", content: { message: inputValue } }]);
    setInputValue("");
    setCurrentStep(prev => prev + 1);
  };

  const handleButtonClick = (btn: { label: string; link?: string }) => {
    if (btn.link) {
      window.open(btn.link, "_blank", "noopener,noreferrer");
      return;
    }
    setMessages(prev => [...prev, { type: "user", content: { message: btn.label } }]);
    setVariables(prev => ({ ...prev, resposta: btn.label }));
    setCurrentStep(prev => prev + 1);
  };

  const waitingForInput = !showLanding && currentStep < blocks.length && blocks[currentStep]?.type === "input";
  const waitingForButtons = !showLanding && currentStep < blocks.length && blocks[currentStep]?.type === "buttons";

  if (notFound) return (
    <div className="min-h-screen bg-[#0b141a] flex items-center justify-center text-white"><p>Funil não encontrado.</p></div>
  );

  if (unpublished) return (
    <div className="min-h-screen bg-[#0b141a] flex items-center justify-center text-white flex-col gap-2">
      <p className="text-lg">🚧 Este funil ainda não foi publicado</p>
      <p className="text-[#8696a0] text-sm">O proprietário precisa publicá-lo primeiro.</p>
    </div>
  );

  // ----- Landing Page -----
  if (showLanding) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: landingPage.bgColor }}>
        <div className="w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ backgroundColor: landingPage.bgColor }}>
          {landingPage.heroImageUrl ? (
            <div className="relative w-full aspect-[4/5] flex flex-col">
              <img src={landingPage.heroImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="relative mt-auto p-6 w-full text-center">
                {landingPage.title && <h1 className="text-white font-bold text-2xl md:text-3xl mb-2">{landingPage.title}</h1>}
                {landingPage.subtitle && <p className="text-white/80 text-sm md:text-base mb-5">{landingPage.subtitle}</p>}
                <button
                  onClick={() => setShowLanding(false)}
                  className="w-full py-3.5 rounded-xl bg-white text-black font-semibold hover:scale-[1.02] transition-transform"
                >
                  {landingPage.ctaText || "Iniciar Conversa"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              {landingPage.title && <h1 className="text-white font-bold text-2xl md:text-3xl mb-2">{landingPage.title}</h1>}
              {landingPage.subtitle && <p className="text-white/70 text-sm md:text-base mb-6">{landingPage.subtitle}</p>}
              <button
                onClick={() => setShowLanding(false)}
                className="w-full py-3.5 rounded-xl bg-white text-black font-semibold hover:scale-[1.02] transition-transform"
              >
                {landingPage.ctaText || "Iniciar Conversa"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----- Chat Style helpers -----
  const style = appearance.chatStyle;
  const headerBg =
    style === "messenger" ? "#0084ff" :
    style === "direct" ? "#262626" :
    style === "default" ? "linear-gradient(135deg, hsl(262 83% 58%), hsl(262 83% 40%))" :
    "#1f2c34";

  const userBubble =
    style === "messenger" ? "#0084ff" :
    style === "direct" ? "#3a3a3a" :
    style === "default" ? "hsl(262 83% 58%)" :
    "#005c4b";

  const bubbleRadius =
    style === "messenger" ? "rounded-2xl" :
    style === "direct" ? "rounded-3xl" :
    style === "default" ? "rounded-xl" :
    "rounded-lg";

  const buttonAccent =
    style === "messenger" ? "#0084ff" :
    style === "direct" ? "#ffffff" :
    style === "default" ? "hsl(262 83% 70%)" :
    "#00a884";

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: appearance.bgColor }}>
      <div className="px-4 py-3 flex items-center gap-3 border-b border-white/10" style={{ background: headerBg }}>
        {attendantPhoto ? (
          <img src={attendantPhoto} alt="" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
            {funnelName?.[0]?.toUpperCase() || "Z"}
          </div>
        )}
        <div>
          <p className="text-white font-medium text-sm">{funnelName || "Zapify"}</p>
          <p className="text-white/70 text-xs">{appearance.friendshipText || "online"}</p>
        </div>
      </div>

      <div ref={chatRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-3 py-2 text-sm text-white ${bubbleRadius} ${
                msg.type === "user" ? "rounded-br-none" : "rounded-bl-none"
              }`}
              style={{ backgroundColor: msg.type === "user" ? userBubble : appearance.balloonColor }}
            >
              <MessageContent msg={msg} onButtonClick={handleButtonClick} replaceVars={replaceVars} buttonAccent={buttonAccent} />
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-[10px] text-white/60">
                  {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
                {msg.type === "user" && <CheckCheck className="h-3 w-3 text-[#53bdeb]" />}
              </div>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className={`px-4 py-3 ${bubbleRadius} rounded-bl-none`} style={{ backgroundColor: appearance.balloonColor }}>
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {waitingForInput && (
        <div className="px-3 py-2 flex items-center gap-2 border-t border-white/10" style={{ backgroundColor: appearance.balloonColor }}>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendInput()}
            placeholder={blocks[currentStep]?.content?.placeholder || appearance.messageFieldText}
            className="flex-1 bg-white/10 border-none text-white placeholder:text-white/50 focus-visible:ring-0"
          />
          <Button size="icon" className="rounded-full" style={{ backgroundColor: buttonAccent }} onClick={handleSendInput}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}

      {!waitingForInput && !waitingForButtons && currentStep >= blocks.length && messages.length > 0 && (
        <div className="px-4 py-3 text-center border-t border-white/10" style={{ backgroundColor: appearance.balloonColor }}>
          <p className="text-white/60 text-sm">✅ Conversa finalizada</p>
        </div>
      )}
    </div>
  );
}

function MessageContent({ msg, onButtonClick, replaceVars, buttonAccent }: {
  msg: { type: string; content: any; blockType?: string };
  onButtonClick: (btn: { label: string; link?: string }) => void;
  replaceVars: (t: string) => string;
  buttonAccent: string;
}) {
  const c = msg.content;
  if (msg.type === "user") return <p>{c.message}</p>;
  switch (msg.blockType) {
    case "text":
      return <p className="whitespace-pre-wrap">{replaceVars(c.message || "")}</p>;
    case "image":
      return (
        <div>
          {c.url && <img src={c.url} alt={c.caption || ""} className="rounded-md max-w-full mb-1" />}
          {c.caption && <p className="text-xs text-white/70">{replaceVars(c.caption)}</p>}
        </div>
      );
    case "video":
      return (
        <div>
          {c.url && <video src={c.url} controls className="rounded-md max-w-full mb-1" />}
          {c.caption && <p className="text-xs text-white/70">{replaceVars(c.caption)}</p>}
        </div>
      );
    case "audio":
      return c.url ? <audio src={c.url} controls className="w-full" /> : null;
    case "buttons":
      return (
        <div>
          {c.message && <p className="mb-2 whitespace-pre-wrap">{replaceVars(c.message)}</p>}
          <div className="flex flex-col gap-1 mt-1">
            {(c.buttons ?? []).map((btn: any, i: number) => (
              <button
                key={i}
                onClick={() => onButtonClick(btn)}
                className="text-left px-3 py-2 rounded bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
                style={{ color: buttonAccent }}
              >
                {btn.label}{btn.link ? " ↗" : ""}
              </button>
            ))}
          </div>
        </div>
      );
    case "input":
      return <p className="whitespace-pre-wrap">{replaceVars(c.placeholder || "Digite sua resposta...")}</p>;
    default:
      return null;
  }
}
