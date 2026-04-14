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

export default function PublicFunnel() {
  const { slug } = useParams();
  const [blocks, setBlocks] = useState<FunnelBlock[]>([]);
  const [funnelName, setFunnelName] = useState("");
  const [funnelId, setFunnelId] = useState("");
  const [attendantPhoto, setAttendantPhoto] = useState("");
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
        .from("funnels").select("id, name, status, attendant_photo_url").eq("slug", slug).single();
      if (!funnel) { setNotFound(true); return; }
      if (funnel.status !== "published") { setUnpublished(true); return; }
      setFunnelName(funnel.name);
      setFunnelId(funnel.id);
      setAttendantPhoto(funnel.attendant_photo_url ?? "");

      const { data: blocksData } = await supabase
        .from("funnel_blocks").select("*").eq("funnel_id", funnel.id)
        .order("sort_order", { ascending: true });
      setBlocks((blocksData ?? []).map(b => ({ ...b, content: (b.content as Record<string, any>) ?? {} })));
    };
    load();
  }, [slug]);

  useEffect(() => {
    if (blocks.length === 0 || processedRef.current >= blocks.length) return;
    processNextBlock();
  }, [blocks, currentStep]);

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

  const handleButtonClick = (label: string) => {
    setMessages(prev => [...prev, { type: "user", content: { message: label } }]);
    setVariables(prev => ({ ...prev, resposta: label }));
    setCurrentStep(prev => prev + 1);
  };

  const waitingForInput = currentStep < blocks.length && blocks[currentStep]?.type === "input";
  const waitingForButtons = currentStep < blocks.length && blocks[currentStep]?.type === "buttons";

  if (notFound) return (
    <div className="min-h-screen bg-[#0b141a] flex items-center justify-center text-white"><p>Funil não encontrado.</p></div>
  );

  if (unpublished) return (
    <div className="min-h-screen bg-[#0b141a] flex items-center justify-center text-white flex-col gap-2">
      <p className="text-lg">🚧 Este funil ainda não foi publicado</p>
      <p className="text-[#8696a0] text-sm">O proprietário precisa publicá-lo primeiro.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b141a] flex flex-col">
      <div className="bg-[#1f2c34] px-4 py-3 flex items-center gap-3 border-b border-[#2a3942]">
        {attendantPhoto ? (
          <img src={attendantPhoto} alt="" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">Z</div>
        )}
        <div>
          <p className="text-white font-medium text-sm">{funnelName || "Zapify"}</p>
          <p className="text-[#8696a0] text-xs">online</p>
        </div>
      </div>

      <div ref={chatRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-2"
        style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzA2MDkwYyIvPgo8Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIwLjUiIGZpbGw9IiMwZDE1MWIiLz4KPC9zdmc+')", backgroundRepeat: "repeat" }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              msg.type === "user" ? "bg-[#005c4b] text-white rounded-br-none" : "bg-[#1f2c34] text-[#e9edef] rounded-bl-none"
            }`}>
              <MessageContent msg={msg} onButtonClick={handleButtonClick} replaceVars={replaceVars} />
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-[10px] text-[#8696a0]">
                  {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
                {msg.type === "user" && <CheckCheck className="h-3 w-3 text-[#53bdeb]" />}
              </div>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-[#1f2c34] rounded-lg px-4 py-3 rounded-bl-none">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-[#8696a0] animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-[#8696a0] animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-[#8696a0] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {waitingForInput && (
        <div className="bg-[#1f2c34] px-3 py-2 flex items-center gap-2 border-t border-[#2a3942]">
          <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendInput()}
            placeholder={blocks[currentStep]?.content?.placeholder || "Digite aqui..."}
            className="flex-1 bg-[#2a3942] border-none text-white placeholder:text-[#8696a0] focus-visible:ring-0" />
          <Button size="icon" className="rounded-full bg-primary" onClick={handleSendInput}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}

      {!waitingForInput && !waitingForButtons && currentStep >= blocks.length && messages.length > 0 && (
        <div className="bg-[#1f2c34] px-4 py-3 text-center border-t border-[#2a3942]">
          <p className="text-[#8696a0] text-sm">✅ Conversa finalizada</p>
        </div>
      )}
    </div>
  );
}

function MessageContent({ msg, onButtonClick, replaceVars }: {
  msg: { type: string; content: any; blockType?: string };
  onButtonClick: (label: string) => void;
  replaceVars: (t: string) => string;
}) {
  const c = msg.content;
  if (msg.type === "user") return <p>{c.message}</p>;
  switch (msg.blockType) {
    case "text": return <p className="whitespace-pre-wrap">{replaceVars(c.message || "")}</p>;
    case "image": return (<div>{c.url && <img src={c.url} alt={c.caption || ""} className="rounded-md max-w-full mb-1" />}{c.caption && <p className="text-xs text-[#8696a0]">{replaceVars(c.caption)}</p>}</div>);
    case "video": return (<div>{c.url && <video src={c.url} controls className="rounded-md max-w-full mb-1" />}{c.caption && <p className="text-xs text-[#8696a0]">{replaceVars(c.caption)}</p>}</div>);
    case "audio": return c.url ? <audio src={c.url} controls className="w-full" /> : null;
    case "buttons": return (<div>{c.message && <p className="mb-2 whitespace-pre-wrap">{replaceVars(c.message)}</p>}<div className="flex flex-col gap-1 mt-1">{(c.buttons ?? []).map((btn: any, i: number) => (<button key={i} onClick={() => onButtonClick(btn.label)} className="text-left px-3 py-2 rounded bg-[#2a3942] hover:bg-[#3a4a52] text-[#00a884] text-sm font-medium transition-colors">{btn.label}</button>))}</div></div>);
    case "input": return <p className="whitespace-pre-wrap">{replaceVars(c.placeholder || "Digite sua resposta...")}</p>;
    default: return null;
  }
}
