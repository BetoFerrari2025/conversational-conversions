import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Crown, Star, Gift, Wifi, Eye, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  funnel_count: number;
}

interface UserFunnel {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
  block_count: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userFunnels, setUserFunnels] = useState<UserFunnel[]>([]);
  const [loadingFunnels, setLoadingFunnels] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      if (data !== true) {
        navigate("/dashboard");
        return;
      }
      setIsAdmin(true);
      loadData();
    });
  }, [user]);

  const loadData = async () => {
    const { data: usersData } = await supabase.rpc("admin_get_users");
    setUsers((usersData as AdminUser[]) ?? []);

    // Count online users (last seen within 60s)
    const threshold = new Date(Date.now() - 60000).toISOString();
    const { count } = await supabase.from("user_presence")
      .select("*", { count: "exact", head: true })
      .eq("is_online", true)
      .gte("last_seen", threshold);
    setOnlineCount(count ?? 0);
    setLoading(false);
  };

  // Realtime online count
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase.channel("presence-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_presence" }, () => {
        const threshold = new Date(Date.now() - 60000).toISOString();
        supabase.from("user_presence").select("*", { count: "exact", head: true })
          .eq("is_online", true).gte("last_seen", threshold)
          .then(({ count }) => setOnlineCount(count ?? 0));
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  const viewUserDetails = async (u: AdminUser) => {
    setSelectedUser(u);
    setLoadingFunnels(true);
    const { data } = await supabase.rpc("admin_get_user_funnels", { _user_id: u.id });
    setUserFunnels((data as UserFunnel[]) ?? []);
    setLoadingFunnels(false);
  };

  const getUserPlan = (_user: AdminUser) => "Teste Gratuito"; // Placeholder - integrate with payment system

  if (isAdmin === null || loading) return <p className="text-muted-foreground p-6">Carregando...</p>;
  if (!isAdmin) return null;

  const totalUsers = users.length;
  const planCounts = { pro: 0, premium: 0, free: totalUsers }; // Placeholder

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Área Admin</h1>
        <p className="text-muted-foreground mt-1">Gerenciamento de usuários e métricas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <Card className="glass border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{totalUsers}</p>
              <p className="text-xs text-muted-foreground">Total Usuários</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10"><Crown className="h-5 w-5 text-amber-500" /></div>
            <div>
              <p className="text-2xl font-bold">{planCounts.pro}</p>
              <p className="text-xs text-muted-foreground">Plano PRO</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10"><Star className="h-5 w-5 text-purple-500" /></div>
            <div>
              <p className="text-2xl font-bold">{planCounts.premium}</p>
              <p className="text-xs text-muted-foreground">Plano Premium</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted"><Gift className="h-5 w-5 text-muted-foreground" /></div>
            <div>
              <p className="text-2xl font-bold">{planCounts.free}</p>
              <p className="text-xs text-muted-foreground">Teste Gratuito</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50 border-green-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><Wifi className="h-5 w-5 text-green-500" /></div>
            <div>
              <p className="text-2xl font-bold text-green-500">{onlineCount}</p>
              <p className="text-xs text-muted-foreground">Online Agora</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Celular</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Funis</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.display_name || "—"}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.phone || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={u.last_sign_in_at ? "border-green-500/50 text-green-500" : "border-muted"}>
                        {u.last_sign_in_at ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getUserPlan(u)}</Badge>
                    </TableCell>
                    <TableCell>{u.funnel_count}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => viewUserDetails(u)}>
                        <Eye className="mr-1 h-3 w-3" />Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="glass max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes - {selectedUser?.display_name || selectedUser?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Email:</span> {selectedUser?.email}</div>
              <div><span className="text-muted-foreground">Celular:</span> {selectedUser?.phone || "—"}</div>
              <div><span className="text-muted-foreground">Cadastro:</span> {selectedUser?.created_at ? new Date(selectedUser.created_at).toLocaleDateString("pt-BR") : "—"}</div>
              <div><span className="text-muted-foreground">Último acesso:</span> {selectedUser?.last_sign_in_at ? new Date(selectedUser.last_sign_in_at).toLocaleDateString("pt-BR") : "—"}</div>
            </div>

            <h4 className="font-medium mt-4">Funis ({userFunnels.length})</h4>
            {loadingFunnels ? (
              <p className="text-muted-foreground text-sm">Carregando...</p>
            ) : userFunnels.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum funil criado</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Blocos</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userFunnels.map(f => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell>
                        <Badge className={f.status === "published" ? "bg-primary/20 text-primary" : "bg-secondary"}>
                          {f.status === "published" ? "Publicado" : "Rascunho"}
                        </Badge>
                      </TableCell>
                      <TableCell>{f.block_count}</TableCell>
                      <TableCell>{new Date(f.created_at).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <Link to={`/f/${f.slug}`} target="_blank">
                          <Button size="sm" variant="ghost"><ExternalLink className="h-3 w-3" /></Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
