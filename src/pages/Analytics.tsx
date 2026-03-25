import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Activity, Users, Eye, Clock, Monitor, Smartphone, Tablet, Globe, TrendingUp, Download, ArrowLeft, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { toast } from "sonner";

const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

const Analytics = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  const [timeRange, setTimeRange] = useState("7d");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // Data states
  const [visitors, setVisitors] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [pageViews, setPageViews] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { navigate("/auth"); return; }
    if (!adminLoading && !isAdmin && user) {
      toast.error("Acesso negado");
      navigate("/");
      return;
    }
  }, [user, authLoading, isAdmin, adminLoading, navigate]);

  const getDateFilter = useCallback(() => {
    const now = new Date();
    switch (timeRange) {
      case "today": return new Date(now.setHours(0, 0, 0, 0)).toISOString();
      case "7d": return new Date(Date.now() - 7 * 86400000).toISOString();
      case "30d": return new Date(Date.now() - 30 * 86400000).toISOString();
      case "90d": return new Date(Date.now() - 90 * 86400000).toISOString();
      default: return new Date(Date.now() - 7 * 86400000).toISOString();
    }
  }, [timeRange]);

  const fetchData = useCallback(async (showLoader = true) => {
    if (!isAdmin) return;
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const dateFilter = getDateFilter();

      const [visitorsRes, sessionsRes, pageViewsRes] = await Promise.all([
        supabase.from("analytics_visitors").select("*").gte("last_visit", dateFilter).order("last_visit", { ascending: false }),
        supabase.from("analytics_sessions").select("*").gte("started_at", dateFilter).order("started_at", { ascending: false }),
        supabase.from("analytics_page_views").select("*").gte("viewed_at", dateFilter).order("viewed_at", { ascending: false }),
      ]);

      if (visitorsRes.data) setVisitors(visitorsRes.data);
      if (sessionsRes.data) setSessions(sessionsRes.data);
      if (pageViewsRes.data) setPageViews(pageViewsRes.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin, getDateFilter]);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin, fetchData]);

  // Auto-refresh every 30s
  useEffect(() => {
    if (isAdmin) {
      intervalRef.current = setInterval(() => fetchData(false), 30000);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
  }, [isAdmin, fetchData]);

  // Filter out admin data
  const filteredSessions = useMemo(() => sessions.filter(s => !s.is_admin), [sessions]);
  const filteredVisitors = useMemo(() => visitors.filter(v => !v.is_admin), [visitors]);

  // Stats
  const stats = useMemo(() => {
    const totalVisits = filteredSessions.length;
    const uniqueVisitors = filteredVisitors.length;
    const newVisitors = filteredVisitors.filter(v => !v.is_returning).length;
    const returningVisitors = filteredVisitors.filter(v => v.is_returning).length;
    const totalPageViews = pageViews.length;

    // Active now (sessions in last 5 min)
    const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
    const activeNow = filteredSessions.filter(s => s.started_at >= fiveMinAgo).length;

    return { totalVisits, uniqueVisitors, newVisitors, returningVisitors, totalPageViews, activeNow };
  }, [filteredSessions, filteredVisitors, pageViews]);

  // Charts data
  const visitsByDay = useMemo(() => {
    const days: Record<string, number> = {};
    filteredSessions.forEach(s => {
      const day = new Date(s.started_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      days[day] = (days[day] || 0) + 1;
    });
    return Object.entries(days).map(([date, visits]) => ({ date, visits })).reverse().slice(-14);
  }, [filteredSessions]);

  const deviceData = useMemo(() => {
    const devices: Record<string, number> = {};
    filteredSessions.forEach(s => {
      const d = s.device || "Desconhecido";
      devices[d] = (devices[d] || 0) + 1;
    });
    return Object.entries(devices).map(([name, value]) => ({ name, value }));
  }, [filteredSessions]);

  const topPages = useMemo(() => {
    const pages: Record<string, number> = {};
    pageViews.forEach(pv => {
      pages[pv.page_url] = (pages[pv.page_url] || 0) + 1;
    });
    return Object.entries(pages)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 20);
  }, [pageViews]);

  const topCities = useMemo(() => {
    const cities: Record<string, number> = {};
    filteredSessions.forEach(s => {
      const c = s.city || s.country || "Desconhecido";
      cities[c] = (cities[c] || 0) + 1;
    });
    return Object.entries(cities)
      .map(([city, visits]) => ({ city, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 15);
  }, [filteredSessions]);

  const browserData = useMemo(() => {
    const browsers: Record<string, number> = {};
    filteredSessions.forEach(s => {
      const b = s.browser || "Outro";
      browsers[b] = (browsers[b] || 0) + 1;
    });
    return Object.entries(browsers).map(([name, value]) => ({ name, value }));
  }, [filteredSessions]);

  const newVsReturning = useMemo(() => [
    { name: "Novos", value: stats.newVisitors },
    { name: "Recorrentes", value: stats.returningVisitors },
  ], [stats]);

  const handleExportCSV = useCallback(() => {
    const rows = [["Página", "Visualizações"]];
    topPages.forEach(p => rows.push([p.page, String(p.views)]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado com sucesso");
  }, [topPages]);

  if (authLoading || adminLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) return null;

  const DeviceIcon = ({ type }: { type: string }) => {
    if (type === "Mobile") return <Smartphone className="h-4 w-4" />;
    if (type === "Tablet") return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <MainLayout>
      <div className="px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Activity className="h-7 w-7 text-primary" />
                  Analytics
                </h1>
                <p className="text-muted-foreground text-sm">Dados em tempo real do BahiaVagas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => fetchData(false)} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-1" /> CSV
              </Button>
            </div>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Atualização automática a cada 30s
            {refreshing && <span className="text-xs">(atualizando...)</span>}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Activity className="h-3 w-3" /> Ativos agora
                </div>
                <p className="text-2xl font-bold text-green-600">{stats.activeNow}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Users className="h-3 w-3" /> Visitantes
                </div>
                <p className="text-2xl font-bold">{stats.uniqueVisitors}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <TrendingUp className="h-3 w-3" /> Sessões
                </div>
                <p className="text-2xl font-bold">{stats.totalVisits}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Eye className="h-3 w-3" /> Páginas vistas
                </div>
                <p className="text-2xl font-bold">{stats.totalPageViews}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Users className="h-3 w-3" /> Novos
                </div>
                <p className="text-2xl font-bold text-blue-600">{stats.newVisitors}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Users className="h-3 w-3" /> Recorrentes
                </div>
                <p className="text-2xl font-bold text-purple-600">{stats.returningVisitors}</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="flex-wrap">
              <TabsTrigger value="dashboard">Visão Geral</TabsTrigger>
              <TabsTrigger value="pages">Páginas</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="geo">Geolocalização</TabsTrigger>
              <TabsTrigger value="devices">Dispositivos</TabsTrigger>
              <TabsTrigger value="realtime">Tempo Real</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-base">Visitas por dia</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={visitsByDay}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Line type="monotone" dataKey="visits" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base">Novos vs Recorrentes</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={newVsReturning} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {newVsReturning.map((_, i) => (
                            <Cell key={i} fill={COLORS[i]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-base">Dispositivos</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={deviceData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {deviceData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base">Navegadores</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={browserData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Pages Tab */}
            <TabsContent value="pages">
              <Card>
                <CardHeader><CardTitle className="text-base">Páginas mais acessadas</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Página</TableHead>
                        <TableHead className="text-right">Visualizações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topPages.map((p, i) => (
                        <TableRow key={p.page}>
                          <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                          <TableCell className="font-mono text-sm">{p.page}</TableCell>
                          <TableCell className="text-right font-semibold">{p.views}</TableCell>
                        </TableRow>
                      ))}
                      {topPages.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                            Nenhum dado disponível
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader><CardTitle className="text-base">Visitantes</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID (hash)</TableHead>
                        <TableHead>Primeira visita</TableHead>
                        <TableHead>Última visita</TableHead>
                        <TableHead>Visitas</TableHead>
                        <TableHead>Tipo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVisitors.slice(0, 50).map(v => (
                        <TableRow key={v.id}>
                          <TableCell className="font-mono text-xs">{v.ip_hash?.substring(0, 12)}...</TableCell>
                          <TableCell className="text-sm">{new Date(v.first_visit).toLocaleString("pt-BR")}</TableCell>
                          <TableCell className="text-sm">{new Date(v.last_visit).toLocaleString("pt-BR")}</TableCell>
                          <TableCell className="font-semibold">{v.visit_count}</TableCell>
                          <TableCell>
                            <Badge variant={v.is_returning ? "default" : "secondary"}>
                              {v.is_returning ? "Recorrente" : "Novo"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Geo Tab */}
            <TabsContent value="geo">
              <Card>
                <CardHeader><CardTitle className="text-base">Acessos por localização</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topCities.slice(0, 10)} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis type="number" className="text-xs" />
                          <YAxis type="category" dataKey="city" width={120} className="text-xs" />
                          <Tooltip />
                          <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Localização</TableHead>
                          <TableHead className="text-right">Visitas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topCities.map(c => (
                          <TableRow key={c.city}>
                            <TableCell className="flex items-center gap-2">
                              <Globe className="h-3 w-3 text-muted-foreground" />
                              {c.city}
                            </TableCell>
                            <TableCell className="text-right font-semibold">{c.visits}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Devices Tab */}
            <TabsContent value="devices">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-base">Distribuição por dispositivo</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={deviceData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {deviceData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Detalhes</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {deviceData.map((d, i) => (
                        <div key={d.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <DeviceIcon type={d.name} />
                            <span className="font-medium">{d.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold">{d.value}</span>
                            <Badge variant="outline">
                              {filteredSessions.length > 0 ? ((d.value / filteredSessions.length) * 100).toFixed(0) : 0}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Realtime Tab */}
            <TabsContent value="realtime">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Sessões recentes (últimas 50)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dispositivo</TableHead>
                        <TableHead>Navegador</TableHead>
                        <TableHead>País</TableHead>
                        <TableHead>Cidade</TableHead>
                        <TableHead>Referência</TableHead>
                        <TableHead>Início</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSessions.slice(0, 50).map(s => (
                        <TableRow key={s.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <DeviceIcon type={s.device || "Desktop"} />
                              {s.device || "—"}
                            </div>
                          </TableCell>
                          <TableCell>{s.browser || "—"}</TableCell>
                          <TableCell>{s.country || "—"}</TableCell>
                          <TableCell>{s.city || "—"}</TableCell>
                          <TableCell className="text-xs max-w-[150px] truncate">{s.referrer || "Direto"}</TableCell>
                          <TableCell className="text-sm">{new Date(s.started_at).toLocaleString("pt-BR")}</TableCell>
                        </TableRow>
                      ))}
                      {filteredSessions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            Nenhuma sessão registrada
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Analytics;
