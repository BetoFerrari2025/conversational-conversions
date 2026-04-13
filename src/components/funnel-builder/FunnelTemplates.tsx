import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, ShoppingCart, MessageCircle } from "lucide-react";

const TEMPLATES = [
  {
    id: "lead-capture",
    name: "Captura de Leads",
    description: "Coleta nome, email e telefone com mensagens persuasivas",
    icon: FileText,
    blocks: [
      { type: "text", content: { message: "Olá! 👋 Seja bem-vindo(a)!" } },
      { type: "delay", content: { seconds: 1 } },
      { type: "text", content: { message: "Tenho algo especial preparado para você. Mas primeiro, preciso saber seu nome 😊" } },
      { type: "input", content: { placeholder: "Digite seu nome...", variable: "nome", inputType: "text" } },
      { type: "text", content: { message: "Prazer, {{nome}}! 🎉\n\nAgora me passa seu melhor email para eu te enviar o material exclusivo:" } },
      { type: "input", content: { placeholder: "seu@email.com", variable: "email", inputType: "email" } },
      { type: "text", content: { message: "Perfeito! E qual seu WhatsApp? Assim posso te avisar de novidades 📱" } },
      { type: "input", content: { placeholder: "(11) 99999-9999", variable: "telefone", inputType: "phone" } },
      { type: "text", content: { message: "Pronto, {{nome}}! ✅\n\nVocê vai receber tudo no email {{email}}.\n\nFique de olho! 🚀" } },
    ],
  },
  {
    id: "sales-vsl",
    name: "Funil de Vendas (VSL)",
    description: "Apresenta um vídeo de vendas e direciona para a compra",
    icon: ShoppingCart,
    blocks: [
      { type: "text", content: { message: "Ei! 👋 Que bom que você chegou até aqui..." } },
      { type: "delay", content: { seconds: 2 } },
      { type: "text", content: { message: "Eu preciso te mostrar algo que vai mudar completamente a forma como você [resultado desejado]" } },
      { type: "delay", content: { seconds: 1 } },
      { type: "text", content: { message: "Assista esse vídeo até o final, é rápido e vale MUITO a pena 👇" } },
      { type: "video", content: { url: "", caption: "Assista até o final!" } },
      { type: "delay", content: { seconds: 3 } },
      { type: "text", content: { message: "E aí, o que achou? 🤔" } },
      { type: "buttons", content: { message: "Você quer aproveitar essa oportunidade?", buttons: [{ label: "🔥 SIM, quero começar!", value: "sim" }, { label: "Tenho dúvidas", value: "duvidas" }] } },
      { type: "text", content: { message: "Perfeito! Clica no link abaixo para garantir sua vaga com desconto especial 👇\n\nhttps://seu-link-de-vendas.com" } },
    ],
  },
  {
    id: "whatsapp-redirect",
    name: "Redirecionamento WhatsApp",
    description: "Qualifica o lead e redireciona para o WhatsApp",
    icon: MessageCircle,
    blocks: [
      { type: "text", content: { message: "Oi! 😄 Tudo bem?" } },
      { type: "delay", content: { seconds: 1 } },
      { type: "text", content: { message: "Vi que você tem interesse em [seu produto/serviço]. Deixa eu te fazer algumas perguntas rápidas para te ajudar melhor!" } },
      { type: "input", content: { placeholder: "Seu nome...", variable: "nome", inputType: "text" } },
      { type: "buttons", content: { message: "{{nome}}, qual seu principal objetivo?", buttons: [{ label: "📈 Aumentar vendas", value: "vendas" }, { label: "🎯 Gerar mais leads", value: "leads" }, { label: "🚀 Escalar meu negócio", value: "escalar" }] } },
      { type: "buttons", content: { message: "E qual seu faturamento mensal atual?", buttons: [{ label: "Até R$ 10k", value: "10k" }, { label: "R$ 10k - 50k", value: "50k" }, { label: "Acima de R$ 50k", value: "50k+" }] } },
      { type: "text", content: { message: "Maravilha, {{nome}}! 🎉\n\nCom base nas suas respostas, tenho certeza que posso te ajudar.\n\nClica no botão abaixo pra falar comigo diretamente no WhatsApp 👇" } },
      { type: "buttons", content: { message: "", buttons: [{ label: "💬 Falar no WhatsApp", value: "https://wa.me/5511999999999" }] } },
    ],
  },
];

interface FunnelTemplatesProps {
  onSelect: (blocks: Array<{ type: string; content: Record<string, any> }>) => void;
}

export function FunnelTemplates({ onSelect }: FunnelTemplatesProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <FileText className="mr-2 h-4 w-4" />
          Usar Template Pronto
        </Button>
      </DialogTrigger>
      <DialogContent className="glass max-w-2xl">
        <DialogHeader>
          <DialogTitle>Escolha um Template</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-3">
          {TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <Card
                key={tpl.id}
                className="glass border-border/50 hover:border-primary/50 cursor-pointer transition-all"
                onClick={() => onSelect(tpl.blocks)}
              >
                <CardHeader className="pb-2">
                  <Icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-sm">{tpl.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{tpl.description}</p>
                  <p className="text-xs text-primary mt-2">{tpl.blocks.length} blocos</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
