import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from "lucide-react";

interface MediaUploadProps {
  label: string;
  accept: string;
  currentUrl: string;
  onUploaded: (url: string) => void;
  preview?: "image" | "video" | "audio";
}

export function MediaUpload({ label, accept, currentUrl, onUploaded, preview }: MediaUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("funnel-media")
      .upload(path, file, { upsert: true });

    if (!error) {
      const { data } = supabase.storage.from("funnel-media").getPublicUrl(path);
      onUploaded(data.publicUrl);
    }
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={currentUrl}
          onChange={(e) => onUploaded(e.target.value)}
          placeholder="URL ou faça upload..."
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        </Button>
        {currentUrl && (
          <Button type="button" variant="ghost" size="icon" onClick={() => onUploaded("")}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={handleUpload} />

      {currentUrl && preview === "image" && (
        <img src={currentUrl} alt="Preview" className="rounded-md max-h-32 object-cover" />
      )}
      {currentUrl && preview === "video" && (
        <video src={currentUrl} controls className="rounded-md max-h-32 w-full" />
      )}
      {currentUrl && preview === "audio" && (
        <audio src={currentUrl} controls className="w-full mt-1" />
      )}
    </div>
  );
}
