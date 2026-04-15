import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { MediaUpload } from "./MediaUpload";

const BG_COLORS = [
  "#0b141a", "#1a1a2e", "#16213e", "#0f3460", "#1b1b2f",
  "#2d132c", "#000000", "#1c1c1c", "#0d1b2a", "#1b263b",
];

const BALLOON_COLORS = [
  "#1f2c34", "#075e54", "#128c7e", "#25d366", "#dcf8c6",
  "#34b7f1", "#e74c3c", "#8e44ad", "#2ecc71", "#f39c12",
];

const CHAT_STYLES = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "messenger", label: "Messenger" },
  { id: "direct", label: "Direct" },
  { id: "default", label: "Padrão" },
];

interface AppearanceSettingsProps {
  settings: {
    bgColor: string;
    balloonColor: string;
    chatStyle: string;
    messageFieldText: string;
    friendshipText: string;
  };
  onChange: (settings: any) => void;
}

export function AppearanceSettings({ settings, onChange }: AppearanceSettingsProps) {
  const update = (key: string, value: any) => onChange({ ...settings, [key]: value });

  return (
    <div className="space-y-5 p-4 rounded-lg border border-border/50 bg-card">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        🎨 Configurações de Aparência
      </h3>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Texto do campo de mensagem</Label>
        <Input
          value={settings.messageFieldText}
          onChange={(e) => update("messageFieldText", e.target.value)}
          placeholder="Digite uma mensagem"
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Texto de amizade</Label>
        <Input
          value={settings.friendshipText}
          onChange={(e) => update("friendshipText", e.target.value)}
          placeholder="Vocês são amigos no Facebook"
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Estilo do Chat</Label>
        <div className="grid grid-cols-2 gap-2">
          {CHAT_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => update("chatStyle", style.id)}
              className={`px-3 py-2 rounded-md text-xs font-medium transition-all border ${
                settings.chatStyle === style.id
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-border/50 bg-card text-muted-foreground hover:border-primary/30"
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Cor de Fundo</Label>
        <div className="flex flex-wrap gap-2">
          {BG_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => update("bgColor", color)}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                settings.bgColor === color ? "border-primary scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <input
            type="color"
            value={settings.bgColor}
            onChange={(e) => update("bgColor", e.target.value)}
            className="w-7 h-7 rounded-full cursor-pointer border-0 p-0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Cor do Balão</Label>
        <div className="flex flex-wrap gap-2">
          {BALLOON_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => update("balloonColor", color)}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                settings.balloonColor === color ? "border-primary scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <input
            type="color"
            value={settings.balloonColor}
            onChange={(e) => update("balloonColor", e.target.value)}
            className="w-7 h-7 rounded-full cursor-pointer border-0 p-0"
          />
        </div>
      </div>
    </div>
  );
}
