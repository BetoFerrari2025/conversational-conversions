import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Bot, User } from "lucide-react";

interface Message {
  id: number;
  type: "bot" | "user";
  content: string;
  buttons?: string[];
}

const demoFlow: Omit<Message, "id">[] = [
  { type: "bot", content: "Olá! 👋 Bem-vindo ao Zapify!" },
  { type: "bot", content: "Eu sou o assistente de vendas. Como posso te ajudar hoje?" },
  { type: "bot", content: "Escolha uma opção:", buttons: ["Quero saber mais", "Ver preços", "Falar com humano"] },
];

export default function ChatPreview() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentStep < demoFlow.length) {
      setTyping(true);
      const timer = setTimeout(() => {
        setTyping(false);
        setMessages((prev) => [...prev, { ...demoFlow[currentStep], id: Date.now() }]);
        setCurrentStep((s) => s + 1);
      }, 1200 + Math.random() * 800);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), type: "user", content: text }]);
    setInput("");

    // Bot response
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: "bot", content: `Entendi! Você disse: "${text}". Vou te ajudar com isso! 🚀` },
      ]);
    }, 1500);
  };

  const handleButton = (label: string) => {
    sendMessage(label);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Chat Preview</h1>
        <p className="text-muted-foreground mt-1">Visualize como seu funil aparece no estilo WhatsApp</p>
      </div>

      <div className="max-w-md mx-auto">
        <Card className="glass border-border/50 overflow-hidden">
          {/* Chat header */}
          <CardHeader className="bg-primary/10 border-b border-border/50 py-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Zapify Bot</CardTitle>
                <p className="text-xs text-primary">Online</p>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="p-0">
            <div ref={chatRef} className="h-[400px] overflow-y-auto p-4 space-y-3" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, hsl(120 5% 8%), hsl(120 5% 4%))" }}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="flex items-end gap-1 max-w-[80%]">
                    {msg.type === "bot" && (
                      <Bot className="h-4 w-4 text-primary shrink-0 mb-1" />
                    )}
                    <div>
                      <div
                        className={`rounded-2xl px-4 py-2 text-sm ${
                          msg.type === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-card border border-border/50 text-foreground rounded-bl-md"
                        }`}
                      >
                        {msg.content}
                      </div>
                      {msg.buttons && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {msg.buttons.map((btn) => (
                            <Button
                              key={btn}
                              size="sm"
                              variant="outline"
                              className="text-xs border-primary/30 text-primary hover:bg-primary/10"
                              onClick={() => handleButton(btn)}
                            >
                              {btn}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                    {msg.type === "user" && (
                      <User className="h-4 w-4 text-muted-foreground shrink-0 mb-1" />
                    )}
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <div className="flex items-end gap-1">
                    <Bot className="h-4 w-4 text-primary shrink-0 mb-1" />
                    <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border/50 p-3 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Digite sua mensagem..."
                className="flex-1"
              />
              <Button size="icon" onClick={() => sendMessage(input)}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
