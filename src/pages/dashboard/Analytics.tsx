import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BarChart3, Eye, CheckCircle, TrendingUp } from "lucide-react";

const COLORS = ["hsl(84 81% 44%)", "hsl(142 76% 36%)", "hsl(200 80% 50%)", "hsl(280 80% 50%)"];

export default function Analytics() {
  const { user } = useAuth();
  const [funnelStats, setFunnelStats] = useState<{ name: string; visits: number; completed: number }[]>([]);
  const [totals, setTotals] = useState({ visits: 0, completed: 0, leads: 0 });

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: funnels } = await supabase.from("funnels").select("id, name");
      if (!funnels) return;

      const { data: visits } = await supabase.from("funnel_visits").select("funnel_id, completed");
      const { data: leads } = await supabase.from("leads").select("id");

      const stats = funnels.map((f) => {
        const fVisits = visits?.filter((v) => v.funnel_id === f.id) ?? [];
        return {
          name: f.name,
          visits: fVisits.length,
          completed: fVisits.filter((v) => v.completed).length,
        };
      });

      setFunnelStats(stats);
      setTotals({
        visits: visits?.length ?? 0,
        completed: visits?.filter((v) => v.completed).length ?? 0,
        leads: leads?.length ?? 0,
      });
    };
    fetch();
  }, [user]);

  const conversionRate = totals.visits > 0 ? Math.round((totals.completed / totals.visits) * 100) : 0;

  const pieData = [
    { name: "Completaram", value: totals.completed },
    { name: "Abandonaram", value: totals.visits - totals.completed },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Performance dos seus funis</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Total de Visitas", value: totals.visits, icon: Eye, color: "text-blue-400" },
          { title: "Conversões", value: totals.completed, icon: CheckCircle, color: "text-primary" },
          { title: "Taxa de Conversão", value: `${conversionRate}%`, icon: TrendingUp, color: "text-emerald-400" },
        ].map((card) => (
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Visitas por Funil
            </CardTitle>
          </CardHeader>
          <CardContent>
            {funnelStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(120 5% 15%)" />
                  <XAxis dataKey="name" stroke="hsl(0 0% 55%)" fontSize={12} />
                  <YAxis stroke="hsl(0 0% 55%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: "hsl(120 5% 7%)", border: "1px solid hsl(120 5% 15%)", borderRadius: "8px" }}
                    labelStyle={{ color: "hsl(0 0% 95%)" }}
                  />
                  <Bar dataKey="visits" fill="hsl(84 81% 44%)" radius={[4, 4, 0, 0]} name="Visitas" />
                  <Bar dataKey="completed" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} name="Conversões" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-12 text-muted-foreground">Sem dados ainda</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle>Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            {totals.visits > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label>
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(120 5% 7%)", border: "1px solid hsl(120 5% 15%)", borderRadius: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-12 text-muted-foreground">Sem dados ainda</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
