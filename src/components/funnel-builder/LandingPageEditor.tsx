import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { MediaUpload } from "./MediaUpload";

const LP_BG_COLORS = [
  "#000000", "#0b141a", "#1a1a2e", "#16213e", "#0f3460",
  "#2d132c", "#1b1b2f", "#ffffff", "#f8f9fa", "#1c1c1c",
];

interface LandingPageSettings {
  enabled: boolean;
  bgColor: string;
  heroImageUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
}

interface LandingPageEditorProps {
  settings: LandingPageSettings;
  onChange: (settings: LandingPageSettings) => void;
}

export function LandingPageEditor({ settings, onChange }: LandingPageEditorProps) {
  const update = (key: string, value: any) => onChange({ ...settings, [key]: value });

  return (
    <div className="space-y-4 p-4 rounded-lg border border-border/50 bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">📄 Landing Page</h3>
        <Switch checked={settings.enabled} onCheckedChange={(v) => update("enabled", v)} />
      </div>
      <p className="text-xs text-muted-foreground">Exibe uma página antes do chat</p>

      {settings.enabled && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Cor de Fundo</Label>
            <div className="flex flex-wrap gap-2">
              {LP_BG_COLORS.map((color) => (
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

          <MediaUpload
            label="Imagem Principal"
            accept="image/*"
            currentUrl={settings.heroImageUrl}
            onUploaded={(url) => update("heroImageUrl", url)}
            preview="image"
          />

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Título</Label>
            <Input
              value={settings.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Seu título aqui"
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Subtítulo</Label>
            <Input
              value={settings.subtitle}
              onChange={(e) => update("subtitle", e.target.value)}
              placeholder="Subtítulo da página"
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Texto do Botão</Label>
            <Input
              value={settings.ctaText}
              onChange={(e) => update("ctaText", e.target.value)}
              placeholder="Iniciar Conversa"
              className="h-8 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export type { LandingPageSettings };
