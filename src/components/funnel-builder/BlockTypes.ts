import { Type, Image, Video, MousePointerClick, FormInput, Clock, Mic } from "lucide-react";

export const BLOCK_TYPES = [
  { type: "text", label: "Texto", icon: Type, color: "text-blue-400" },
  { type: "image", label: "Imagem", icon: Image, color: "text-green-400" },
  { type: "video", label: "Vídeo", icon: Video, color: "text-purple-400" },
  { type: "audio", label: "Áudio", icon: Mic, color: "text-teal-400" },
  { type: "buttons", label: "Botões", icon: MousePointerClick, color: "text-yellow-400" },
  { type: "input", label: "Input", icon: FormInput, color: "text-pink-400" },
  { type: "delay", label: "Delay", icon: Clock, color: "text-orange-400" },
];

export const defaultContent: Record<string, Record<string, any>> = {
  text: { message: "" },
  image: { url: "", caption: "" },
  video: { url: "", caption: "" },
  audio: { url: "" },
  buttons: { message: "", buttons: [{ label: "Opção 1", value: "1" }] },
  input: { placeholder: "Digite aqui...", variable: "resposta", inputType: "text" },
  delay: { seconds: 2 },
};

export interface FunnelBlock {
  id: string;
  funnel_id: string;
  type: string;
  content: Record<string, any>;
  sort_order: number;
  position_x: number;
  position_y: number;
  next_block_id: string | null;
  created_at: string;
}
