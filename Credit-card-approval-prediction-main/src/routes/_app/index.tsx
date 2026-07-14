import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { loadApplications, seedDemoData, type ApplicationRecord } from "@/lib/app-store";
import { predict, MODEL_METRICS } from "@/lib/ml-model";
import { ArrowUpRight, CheckCircle2, XCircle, ShieldAlert, TrendingUp, Users, Percent, Brain, Sparkles } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from "recharts";

export const Route = createFileRoute("/_app/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "CreditIQ — Credit Card Approval Dashboard" },
      { name: "description", content: "Real-time credit card approval analytics, model comparison, and applicant risk insights powered by ML." },
    ],
  }),
});

function Dashboard() {
  const [apps, setApps] = useState<ApplicationRecord[]>([]);

  useEffect(() => {
    seedDemoData(predict);
    const refresh = () => setApps(loadApplications());
    refresh();
    window.addEventListener("cc_applications_changed", refresh);
    return () => window.removeEventListener("cc_applications_changed", refresh);
  }, []);

  const total = apps.length;
  const approved = apps.filter((a) => a.result.approved).length;
  const rejected = total - approved;
  const rate = total ? Math.round((approved / total) * 100) : 0;
  const highRisk = apps.filter((a) => a.result.riskLevel === "High" || a.result.riskLevel === "Very High").length;

  const pieData = [
    { name: "Approved", value: approved, color: "var(--color-success)" },
    { name: "Rejected", value: rejected, color: "var(--color-destructive)" },
  ];

  const trendMap = new Map<string, { date: string; approved: number; rejected: number }>();
  apps.forEach((a) => {
    const d = new Date(a.createdAt);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    const cur = trendMap.get(key) || { date: key, approved: 0, rejected: 0 };
    if (a.result.approved) cur.approved++; else cur.rejected++;
    trendMap.set(key, cur);
  });
  const trend = Array.from(trendMap.values()).reverse();

  const recent = apps.slice(0, 6);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-primary font-semibold">Overview</div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">Approval Intelligence Dashboard</h1>
          <p className="text-muted-foreground mt-2">Live insights across every credit card application scored by the model.</p>
        </div>
        <Button asChild size="lg" className="bg-gradient-primary shadow-elegant">
          <Link to="/predict"><Sparkles className="h-4 w-4 mr-2" /> New Prediction</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Applications" value={total.toString()} accent="primary" />
        <StatCard icon={CheckCircle2} label="Approved" value={approved.toString()} accent="success" sub={`${rate}% approval rate`} />
        <StatCard icon={XCircle} label="Rejected" value={rejected.toString()} accent="destructive" />
        <StatCard icon={ShieldAlert} label="High Risk" value={highRisk.toString()} accent="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Application Trend</CardTitle>
            <Badge variant="secondary">Last 30 days</Badge>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="approved" stroke="var(--color-success)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="rejected" stroke="var(--color-destructive)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Percent className="h-5 w-5 text-primary" /> Approval Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /> Model Accuracy</CardTitle>
            <Link to="/models" className="text-sm text-primary hover:underline flex items-center gap-1">Compare all <ArrowUpRight className="h-3 w-3" /></Link>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MODEL_METRICS}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="model" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis domain={[0.8, 1]} stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="accuracy" fill="var(--color-primary)" radius={[8,8,0,0]} />
                <Bar dataKey="rocAuc" fill="var(--color-chart-2)" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.length === 0 && <p className="text-sm text-muted-foreground">No applications yet.</p>}
            {recent.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 pb-3 border-b last:border-0 last:pb-0">
                <div className="min-w-0">
                  <div className="font-medium truncate">{a.name}</div>
                  <div className="text-xs text-muted-foreground">Score {a.result.creditworthiness} · {a.result.riskLevel} risk</div>
                </div>
                <Badge className={a.result.approved ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>
                  {a.result.approved ? "Approved" : "Rejected"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent, sub }: { icon: React.ComponentType<{className?: string}>; label: string; value: string; accent: "primary"|"success"|"destructive"|"warning"; sub?: string }) {
  const styles: Record<string,string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-warning/15 text-warning-foreground",
  };
  return (
    <Card className="shadow-card overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
            <div className="text-3xl font-bold mt-2">{value}</div>
            {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
          </div>
          <div className={`h-11 w-11 rounded-xl grid place-items-center ${styles[accent]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
