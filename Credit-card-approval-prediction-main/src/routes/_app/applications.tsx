import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { loadApplications, deleteApplication, clearApplications, type ApplicationRecord } from "@/lib/app-store";
import { Trash2, Download, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/applications")({
  component: ApplicationsPage,
  head: () => ({ meta: [{ title: "Applications · CreditIQ" }, { name: "description", content: "Every scored credit card application in one searchable ledger." }] }),
});

function ApplicationsPage() {
  const [apps, setApps] = useState<ApplicationRecord[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "approved" | "rejected">("all");

  useEffect(() => {
    const refresh = () => setApps(loadApplications());
    refresh();
    window.addEventListener("cc_applications_changed", refresh);
    return () => window.removeEventListener("cc_applications_changed", refresh);
  }, []);

  const filtered = useMemo(() => apps.filter((a) => {
    if (filter === "approved" && !a.result.approved) return false;
    if (filter === "rejected" && a.result.approved) return false;
    if (q && !a.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [apps, q, filter]);

  const exportCsv = () => {
    const rows = [
      ["Name","Date","Approved","Probability","Risk","CreditScore","Income","DebtRatio"],
      ...filtered.map((a) => [a.name, new Date(a.createdAt).toISOString(), a.result.approved, a.result.probability, a.result.riskLevel, a.input.creditScore, a.input.annualIncome, a.input.debtRatio]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "applications.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-primary font-semibold">Ledger</div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">All Applications</h1>
          <p className="text-muted-foreground mt-2">{apps.length} scored applications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-2" /> Export CSV</Button>
          <Button variant="outline" onClick={() => { if (confirm("Clear all applications?")) { clearApplications(); toast.success("Cleared"); }}}><Trash2 className="h-4 w-4 mr-2" /> Clear</Button>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader className="flex-col md:flex-row md:items-center gap-3 md:justify-between space-y-0">
          <CardTitle>Applications</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search name…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 w-full sm:w-64" />
            </div>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {(["all","approved","rejected"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition ${filter === f ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>{f}</button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Probability</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead className="text-right">Credit Score</TableHead>
                  <TableHead className="text-right">Income</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-10">No applications match.</TableCell></TableRow>
                )}
                {filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={a.result.approved ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>{a.result.approved ? "Approved" : "Rejected"}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">{a.result.probability}%</TableCell>
                    <TableCell><RiskBadge level={a.result.riskLevel} /></TableCell>
                    <TableCell className="text-right font-mono">{a.input.creditScore}</TableCell>
                    <TableCell className="text-right font-mono">${a.input.annualIncome.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => { deleteApplication(a.id); toast.success("Deleted"); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const map: Record<string,string> = {
    "Low": "bg-success/15 text-success border-success/30",
    "Moderate": "bg-primary/10 text-primary border-primary/30",
    "High": "bg-warning/20 text-warning-foreground border-warning/40",
    "Very High": "bg-destructive/15 text-destructive border-destructive/30",
  };
  return <Badge variant="outline" className={map[level] || ""}>{level}</Badge>;
}
