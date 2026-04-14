import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, User, Settings, LogOut } from "lucide-react";
import { useState } from "react";

export function DashboardLayout() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null }>({ display_name: null, avatar_url: null });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name, avatar_url").eq("user_id", user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });

    // Update presence
    const updatePresence = async () => {
      await supabase.from("user_presence").upsert(
        { user_id: user.id, last_seen: new Date().toISOString(), is_online: true },
        { onConflict: "user_id" }
      );
    };
    updatePresence();
    const interval = setInterval(updatePresence, 30000);

    const handleBeforeUnload = () => {
      navigator.sendBeacon && supabase.from("user_presence").update({ is_online: false }).eq("user_id", user.id);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user]);

  const initials = profile.display_name
    ? profile.display_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : (user?.email?.[0]?.toUpperCase() ?? "U");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-background">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <h2 className="text-sm font-medium text-muted-foreground">Zapify Dashboard</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 px-2 gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={profile.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm hidden sm:inline">{profile.display_name || user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
                    <User className="mr-2 h-4 w-4" />Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                    <Settings className="mr-2 h-4 w-4" />Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
