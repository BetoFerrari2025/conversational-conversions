import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch, Users, Eye, TrendingUp } from "lucide-react";

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ funnels: 0, leads: 0, visits: 0, conversionRate: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [funnelsRes, leadsRes, visitsRes] = await Promise.all([
        supabase.from("funnels").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("funnel_visits").select("id, completed", { count: "exact" }),
      ]);

      const totalVisits = visitsRes.count ?? 0;
      const completedVisits = visitsRes.data?.filter((v) => v.completed).length ?? 0;
      const rate = totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0;

      setStats({
        funnels: funnelsRes.count ?? 0,
        leads: leadsRes.count ?? 0,
        visits: totalVisits,
        conversionRate: rate,
      });
    };
    fetchStats();
  }, [user]);

  const cards = [
    { title: "Funis Ativos", value: stats.funnels, icon: GitBranch, color: "text-primary" },
    { title: "Total de Leads", value: stats.leads, icon: Users, color: "text-blue-400" },
    { title: "Visitas", value: stats.visits, icon: Eye, color: "text-purple-400" },
    { title: "Taxa de Conversão", value: `${stats.conversionRate}%`, icon: TrendingUp, color: "text-emerald-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral dos seus funis e métricas</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title} className="glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Início Rápido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <p>👉 Crie seu primeiro funil em <strong className="text-foreground">Funis → Novo Funil</strong></p>
          <p>👉 Acompanhe leads capturados em <strong className="text-foreground">Leads</strong></p>
          <p>👉 Monitore métricas em <strong className="text-foreground">Analytics</strong></p>
        </CardContent>
      </Card>
    </div>
  );
}
