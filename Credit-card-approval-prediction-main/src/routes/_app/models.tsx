import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MODEL_METRICS } from "@/lib/ml-model";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Trophy, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/_app/models")({
  component: ModelsPage,
  head: () => ({ meta: [{ title: "Model Comparison · CreditIQ" }, { name: "description", content: "Accuracy, precision, recall, F1, and ROC-AUC across every trained approval model." }] }),
});

function ModelsPage() {
  const champion = [...MODEL_METRICS].sort((a, b) => b.f1 - a.f1)[0];
  const radarData = ["accuracy","precision","recall","f1","rocAuc"].map((k) => {
    const row: Record<string, string | number> = { metric: k.toUpperCase() };
    MODEL_METRICS.forEach((m) => { row[m.model] = m[k as keyof typeof m] as number; });
    return row;
  });
  const colors = ["var(--color-chart-1)","var(--color-chart-2)","var(--color-chart-3)","var(--color-chart-4)"];

  const confusion = { tp: 428, fp: 21, fn: 24, tn: 327 };
  const total = confusion.tp + confusion.fp + confusion.fn + confusion.tn;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div>
        <div className="text-xs uppercase tracking-wider text-primary font-semibold">Evaluation</div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">Model Comparison</h1>
        <p className="text-muted-foreground mt-2">Cross-validated metrics across all four trained classifiers.</p>
      </div>

      <Card className="shadow-elegant border-0 bg-gradient-hero text-white overflow-hidden">
        <CardContent className="p-8 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/15 grid place-items-center backdrop-blur">
              <Trophy className="h-7 w-7" />
            </div>
            <div>
              <div className="text-sm opacity-80 uppercase tracking-wider">Selected Champion</div>
              <div className="text-3xl font-bold">{champion.model}</div>
              <div className="text-sm opacity-90 mt-1">Persisted via joblib · Deployed to production scoring endpoint</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div><div className="text-xs opacity-80 uppercase">Accuracy</div><div className="text-2xl font-bold">{(champion.accuracy*100).toFixed(1)}%</div></div>
            <div><div className="text-xs opacity-80 uppercase">F1</div><div className="text-2xl font-bold">{(champion.f1*100).toFixed(1)}%</div></div>
            <div><div className="text-xs opacity-80 uppercase">ROC-AUC</div><div className="text-2xl font-bold">{(champion.rocAuc*100).toFixed(1)}%</div></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader><CardTitle>Metric Comparison</CardTitle></CardHeader>
          <CardContent className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MODEL_METRICS}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="model" fontSize={11} stroke="var(--color-muted-foreground)" />
                <YAxis domain={[0.75, 1]} fontSize={11} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="accuracy" fill="var(--color-chart-1)" radius={[6,6,0,0]} />
                <Bar dataKey="precision" fill="var(--color-chart-2)" radius={[6,6,0,0]} />
                <Bar dataKey="recall" fill="var(--color-chart-3)" radius={[6,6,0,0]} />
                <Bar dataKey="f1" fill="var(--color-chart-5)" radius={[6,6,0,0]} />
                <Bar dataKey="rocAuc" fill="var(--color-chart-4)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle>Radar Profile</CardTitle></CardHeader>
          <CardContent className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="metric" fontSize={10} />
                <PolarRadiusAxis domain={[0.75, 1]} fontSize={9} />
                {MODEL_METRICS.map((m, i) => (
                  <Radar key={m.model} name={m.model} dataKey={m.model} stroke={colors[i]} fill={colors[i]} fillOpacity={0.15} />
                ))}
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader><CardTitle>Detailed Metrics</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-right">Accuracy</TableHead>
                  <TableHead className="text-right">Precision</TableHead>
                  <TableHead className="text-right">Recall</TableHead>
                  <TableHead className="text-right">F1</TableHead>
                  <TableHead className="text-right">ROC-AUC</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {MODEL_METRICS.map((m) => (
                  <TableRow key={m.model}>
                    <TableCell className="font-medium">{m.model}</TableCell>
                    <TableCell className="text-right font-mono">{(m.accuracy*100).toFixed(1)}%</TableCell>
                    <TableCell className="text-right font-mono">{(m.precision*100).toFixed(1)}%</TableCell>
                    <TableCell className="text-right font-mono">{(m.recall*100).toFixed(1)}%</TableCell>
                    <TableCell className="text-right font-mono">{(m.f1*100).toFixed(1)}%</TableCell>
                    <TableCell className="text-right font-mono">{(m.rocAuc*100).toFixed(1)}%</TableCell>
                    <TableCell>{m.model === champion.model && <Badge className="bg-gradient-primary">Champion</Badge>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Confusion Matrix</CardTitle>
            <CardDescription>{champion.model} on held-out set ({total} samples)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <ConfCell label="True Positive" value={confusion.tp} tone="success" icon={CheckCircle2} />
              <ConfCell label="False Positive" value={confusion.fp} tone="destructive" icon={XCircle} />
              <ConfCell label="False Negative" value={confusion.fn} tone="warning" icon={XCircle} />
              <ConfCell label="True Negative" value={confusion.tn} tone="success" icon={CheckCircle2} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ConfCell({ label, value, tone, icon: Icon }: { label: string; value: number; tone: "success"|"destructive"|"warning"; icon: React.ComponentType<{className?: string}> }) {
  const toneMap = {
    success: "bg-success/10 border-success/30 text-success",
    destructive: "bg-destructive/10 border-destructive/30 text-destructive",
    warning: "bg-warning/20 border-warning/40 text-warning-foreground",
  };
  return (
    <div className={`rounded-lg border p-4 ${toneMap[tone]}`}>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider"><Icon className="h-3.5 w-3.5" /> {label}</div>
      <div className="text-3xl font-bold mt-2">{value}</div>
    </div>
  );
}
