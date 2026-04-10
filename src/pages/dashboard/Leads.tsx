import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

export default function Leads() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leads, setLeads] = useState<(Tables<"leads"> & { funnels?: { name: string } | null })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("leads")
        .select("*, funnels(name)")
        .order("created_at", { ascending: false });
      setLeads((data as any) ?? []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const exportCSV = () => {
    const headers = ["Nome", "Email", "Telefone", "Funil", "Data"];
    const rows = leads.map((l) => [
      l.name ?? "",
      l.email ?? "",
      l.phone ?? "",
      l.funnels?.name ?? "",
      new Date(l.created_at).toLocaleDateString("pt-BR"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads-zapify.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exportado!" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Leads</h1>
          <p className="text-muted-foreground mt-1">Leads capturados pelos seus funis</p>
        </div>
        <Button variant="outline" onClick={exportCSV} disabled={leads.length === 0}>
          <Download className="mr-2 h-4 w-4" />Exportar CSV
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : leads.length === 0 ? (
        <Card className="glass border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum lead capturado ainda</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Funil</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id} className="border-border/50">
                  <TableCell className="font-medium">{lead.name ?? "—"}</TableCell>
                  <TableCell>{lead.email ?? "—"}</TableCell>
                  <TableCell>{lead.phone ?? "—"}</TableCell>
                  <TableCell>{lead.funnels?.name ?? "—"}</TableCell>
                  <TableCell>{new Date(lead.created_at).toLocaleDateString("pt-BR")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
