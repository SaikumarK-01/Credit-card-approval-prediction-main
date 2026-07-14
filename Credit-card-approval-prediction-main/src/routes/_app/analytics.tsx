import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadApplications, type ApplicationRecord } from "@/lib/app-store";
import { FEATURE_IMPORTANCE } from "@/lib/ml-model";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/_app/analytics")({
  component: AnalyticsPage,
  head: () => ({ meta: [{ title: "Analytics · CreditIQ" }, { name: "description", content: "Income, credit score, and risk distributions across all applications." }] }),
});

function buckets(values: number[], step: number, min: number, max: number, label: (a: number, b: number) => string) {
  const out: { name: string; count: number }[] = [];
  for (let s = min; s < max; s += step) {
    const count = values.filter((v) => v >= s && v < s + step).length;
    out.push({ name: label(s, s + step), count });
  }
  return out;
}

function AnalyticsPage() {
  const [apps, setApps] = useState<ApplicationRecord[]>([]);
  useEffect(() => {
    const refresh = () => setApps(loadApplications());
    refresh();
    window.addEventListener("cc_applications_changed", refresh);
    return () => window.removeEventListener("cc_applications_changed", refresh);
  }, []);

  const incomeDist = buckets(apps.map((a) => a.input.annualIncome), 25000, 0, 200000, (a, b) => `${a/1000}-${b/1000}k`);
  const scoreDist = buckets(apps.map((a) => a.input.creditScore), 50, 400, 850, (a, b) => `${a}-${b}`);
  const scatter = apps.map((a) => ({ x: a.input.creditScore, y: a.input.debtRatio * 100, z: a.result.probability, approved: a.result.approved }));

  const riskCount = ["Low","Moderate","High","Very High"].map((r) => ({ name: r, value: apps.filter((a) => a.result.riskLevel === r).length }));
  const riskColors = ["var(--color-success)","var(--color-chart-1)","var(--color-warning)","var(--color-destructive)"];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div>
        <div className="text-xs uppercase tracking-wider text-primary font-semibold">Analytics</div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">Portfolio Insights</h1>
        <p className="text-muted-foreground mt-2">Distributions, risk segmentation, and driver importance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Annual Income Distribution">
          <BarChart data={incomeDist}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" fontSize={11} stroke="var(--color-muted-foreground)" />
            <YAxis fontSize={11} stroke="var(--color-muted-foreground)" />
            <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
            <Bar dataKey="count" fill="var(--color-primary)" radius={[8,8,0,0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Credit Score Distribution">
          <BarChart data={scoreDist}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" fontSize={11} stroke="var(--color-muted-foreground)" />
            <YAxis fontSize={11} stroke="var(--color-muted-foreground)" />
            <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
            <Bar dataKey="count" fill="var(--color-chart-2)" radius={[8,8,0,0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Feature Importance (XGBoost)">
          <BarChart data={FEATURE_IMPORTANCE} layout="vertical" margin={{ left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis type="number" fontSize={11} stroke="var(--color-muted-foreground)" />
            <YAxis type="category" dataKey="feature" fontSize={11} stroke="var(--color-muted-foreground)" width={140} />
            <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
            <Bar dataKey="importance" fill="var(--color-primary)" radius={[0,8,8,0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Risk Segmentation">
          <PieChart>
            <Pie data={riskCount} dataKey="value" innerRadius={50} outerRadius={95} paddingAngle={3}>
              {riskCount.map((_, i) => <Cell key={i} fill={riskColors[i]} />)}
            </Pie>
            <Legend />
            <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
          </PieChart>
        </ChartCard>

        <Card className="lg:col-span-2 shadow-card">
          <CardHeader><CardTitle>Credit Score vs Debt Ratio (bubble = approval probability)</CardTitle></CardHeader>
          <CardContent className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="x" name="Credit Score" domain={[400, 850]} fontSize={11} stroke="var(--color-muted-foreground)" />
                <YAxis dataKey="y" name="Debt %" domain={[0, 100]} fontSize={11} stroke="var(--color-muted-foreground)" />
                <ZAxis dataKey="z" range={[50, 400]} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Scatter data={scatter.filter((s) => s.approved)} fill="var(--color-success)" name="Approved" />
                <Scatter data={scatter.filter((s) => !s.approved)} fill="var(--color-destructive)" name="Rejected" />
                <Legend />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <Card className="shadow-card">
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
