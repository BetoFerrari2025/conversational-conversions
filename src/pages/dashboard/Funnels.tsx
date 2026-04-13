import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, ExternalLink, Copy, Trash2, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

export default function Funnels() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [funnels, setFunnels] = useState<Tables<"funnels">[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchFunnels = async () => {
    const { data } = await supabase.from("funnels").select("*").order("created_at", { ascending: false });
    setFunnels(data ?? []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchFunnels(); }, [user]);

  const createFunnel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);
    const { error } = await supabase.from("funnels").insert({ name, description, slug, user_id: user.id });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Funil criado!" });
      setName("");
      setDescription("");
      setDialogOpen(false);
      fetchFunnels();
    }
  };

  const deleteFunnel = async (id: string) => {
    const { error } = await supabase.from("funnels").delete().eq("id", id);
    if (!error) {
      setFunnels((prev) => prev.filter((f) => f.id !== id));
      toast({ title: "Funil excluído" });
    }
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/funnel/${slug}`);
    toast({ title: "Link copiado!" });
  };

  const statusColor = (status: string) => {
    if (status === "published") return "bg-primary/20 text-primary";
    if (status === "archived") return "bg-muted text-muted-foreground";
    return "bg-secondary text-secondary-foreground";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Funis</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus funis conversacionais</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Novo Funil</Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>Criar Novo Funil</DialogTitle>
            </DialogHeader>
            <form onSubmit={createFunnel} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Funil</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Funil de Vendas" required />
              </div>
              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição breve" />
              </div>
              <Button type="submit" className="w-full">Criar Funil</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : funnels.length === 0 ? (
        <Card className="glass border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">Nenhum funil criado ainda</p>
            <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Criar Primeiro Funil</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {funnels.map((funnel) => (
            <Card key={funnel.id} className="glass border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{funnel.name}</CardTitle>
                  {funnel.description && (
                    <p className="text-sm text-muted-foreground mt-1">{funnel.description}</p>
                  )}
                </div>
                <Badge className={statusColor(funnel.status)}>{funnel.status}</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link to={`/dashboard/funnels/${funnel.id}/builder`}>
                    <Button size="sm" variant="default">
                      <Pencil className="mr-1 h-3 w-3" />Editar
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => copyLink(funnel.slug)}>
                    <Copy className="mr-1 h-3 w-3" />Link
                  </Button>
                  <Link to={`/funnel/${funnel.slug}`} target="_blank">
                    <Button size="sm" variant="outline">
                      <ExternalLink className="mr-1 h-3 w-3" />Ver
                    </Button>
                  </Link>
                  <Button size="sm" variant="ghost" className="text-destructive ml-auto" onClick={() => deleteFunnel(funnel.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
