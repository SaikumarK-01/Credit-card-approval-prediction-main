import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { predict, type ApplicantInput, type PredictionResult } from "@/lib/ml-model";
import { saveApplication } from "@/lib/app-store";
import { toast } from "sonner";
import { CheckCircle2, XCircle, TrendingUp, AlertTriangle, Sparkles, RefreshCw, User, Briefcase, Wallet, History } from "lucide-react";

export const Route = createFileRoute("/_app/predict")({
  component: PredictPage,
  head: () => ({
    meta: [
      { title: "New Prediction · CreditIQ" },
      { name: "description", content: "Score a credit card application in real time with an XGBoost-powered approval model." },
    ],
  }),
});

const defaults: ApplicantInput & { name: string } = {
  name: "",
  gender: "male",
  age: 32,
  maritalStatus: "single",
  education: "bachelors",
  employmentType: "salaried",
  yearsEmployed: 5,
  occupation: "Engineer",
  annualIncome: 65000,
  monthlyIncome: 5400,
  existingLoan: 8000,
  creditLimit: 12000,
  creditInquiries: 2,
  debtRatio: 0.32,
  creditScore: 720,
  previousDefaults: 0,
  repaymentStatus: "good",
  pastDuePayments: 0,
};

function PredictPage() {
  const [form, setForm] = useState(defaults);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, ...input } = form;
    const r = predict(input);
    setResult(r);
    saveApplication({
      id: crypto.randomUUID(),
      name: name.trim() || "Anonymous Applicant",
      createdAt: new Date().toISOString(),
      input,
      result: r,
    });
    toast.success(r.approved ? "Application approved" : "Application rejected", {
      description: `Probability ${r.probability}% · ${r.riskLevel} risk`,
    });
    setTimeout(() => document.getElementById("result-card")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const reset = () => { setForm(defaults); setResult(null); };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div>
        <div className="text-xs uppercase tracking-wider text-primary font-semibold">Prediction Engine</div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">Credit Card Approval Prediction</h1>
        <p className="text-muted-foreground mt-2">Fill in the applicant profile — our XGBoost model scores in real time.</p>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Section icon={User} title="Personal Information" className="lg:col-span-2">
          <Field label="Applicant Name">
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Jane Doe" />
          </Field>
          <Field label="Gender">
            <SelectBox value={form.gender} onChange={(v) => update("gender", v)} options={[["male","Male"],["female","Female"],["other","Other"]]} />
          </Field>
          <Field label="Age">
            <Input type="number" min={18} max={90} value={form.age} onChange={(e) => update("age", +e.target.value)} />
          </Field>
          <Field label="Marital Status">
            <SelectBox value={form.maritalStatus} onChange={(v) => update("maritalStatus", v)} options={[["single","Single"],["married","Married"],["divorced","Divorced"]]} />
          </Field>
          <Field label="Education">
            <SelectBox value={form.education} onChange={(v) => update("education", v)} options={[["highschool","High School"],["bachelors","Bachelor's"],["masters","Master's"],["phd","PhD"]]} />
          </Field>
        </Section>

        <Section icon={Briefcase} title="Employment">
          <Field label="Employment Type">
            <SelectBox value={form.employmentType} onChange={(v) => update("employmentType", v)} options={[["salaried","Salaried"],["self-employed","Self-employed"],["business","Business Owner"],["unemployed","Unemployed"]]} />
          </Field>
          <Field label="Years Employed">
            <Input type="number" min={0} max={50} value={form.yearsEmployed} onChange={(e) => update("yearsEmployed", +e.target.value)} />
          </Field>
          <Field label="Occupation">
            <Input value={form.occupation} onChange={(e) => update("occupation", e.target.value)} />
          </Field>
        </Section>

        <Section icon={Wallet} title="Financial Information" className="lg:col-span-2">
          <Field label="Annual Income ($)">
            <Input type="number" min={0} value={form.annualIncome} onChange={(e) => update("annualIncome", +e.target.value)} />
          </Field>
          <Field label="Monthly Income ($)">
            <Input type="number" min={0} value={form.monthlyIncome} onChange={(e) => update("monthlyIncome", +e.target.value)} />
          </Field>
          <Field label="Existing Loan Amount ($)">
            <Input type="number" min={0} value={form.existingLoan} onChange={(e) => update("existingLoan", +e.target.value)} />
          </Field>
          <Field label="Requested Credit Limit ($)">
            <Input type="number" min={0} value={form.creditLimit} onChange={(e) => update("creditLimit", +e.target.value)} />
          </Field>
          <Field label="Credit Inquiries (6 mo)">
            <Input type="number" min={0} max={20} value={form.creditInquiries} onChange={(e) => update("creditInquiries", +e.target.value)} />
          </Field>
          <Field label="Debt-to-Income Ratio (0–1)">
            <Input type="number" step="0.01" min={0} max={2} value={form.debtRatio} onChange={(e) => update("debtRatio", +e.target.value)} />
          </Field>
        </Section>

        <Section icon={History} title="Credit History">
          <Field label="Credit Score (300–850)">
            <Input type="number" min={300} max={850} value={form.creditScore} onChange={(e) => update("creditScore", +e.target.value)} />
          </Field>
          <Field label="Previous Defaults">
            <Input type="number" min={0} max={10} value={form.previousDefaults} onChange={(e) => update("previousDefaults", +e.target.value)} />
          </Field>
          <Field label="Repayment Status">
            <SelectBox value={form.repaymentStatus} onChange={(v) => update("repaymentStatus", v)} options={[["excellent","Excellent"],["good","Good"],["fair","Fair"],["poor","Poor"]]} />
          </Field>
          <Field label="Past Due Payments">
            <Input type="number" min={0} max={10} value={form.pastDuePayments} onChange={(e) => update("pastDuePayments", +e.target.value)} />
          </Field>
        </Section>

        <div className="lg:col-span-3 flex flex-wrap gap-3 justify-end">
          <Button type="button" variant="outline" onClick={reset}><RefreshCw className="h-4 w-4 mr-2" /> Reset</Button>
          <Button type="submit" size="lg" className="bg-gradient-primary shadow-elegant">
            <Sparkles className="h-4 w-4 mr-2" /> Run Prediction
          </Button>
        </div>
      </form>

      {result && <ResultCard result={result} />}
    </div>
  );
}

function Section({ icon: Icon, title, children, className = "" }: { icon: React.ComponentType<{className?: string}>; title: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={`shadow-card ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base"><Icon className="h-4 w-4 text-primary" /> {title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</CardContent>
    </Card>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">{label}</Label>{children}</div>;
}
function SelectBox({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>{options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
    </Select>
  );
}

function ResultCard({ result }: { result: PredictionResult }) {
  const approved = result.approved;
  return (
    <div id="result-card" className="grid grid-cols-1 lg:grid-cols-3 gap-6 scroll-mt-6">
      <Card className={`lg:col-span-2 overflow-hidden shadow-elegant border-0 ${approved ? "bg-gradient-success" : "bg-gradient-to-br from-destructive to-destructive/70"} text-white`}>
        <CardContent className="p-8">
          <div className="flex items-center gap-3">
            {approved ? <CheckCircle2 className="h-10 w-10" /> : <XCircle className="h-10 w-10" />}
            <div>
              <div className="text-sm opacity-80 uppercase tracking-wider">Prediction Result</div>
              <div className="text-3xl font-bold">{approved ? "Approved" : "Rejected"}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-8">
            <Metric label="Probability" value={`${result.probability}%`} />
            <Metric label="Risk Level" value={result.riskLevel} />
            <Metric label="Creditworthiness" value={`${result.creditworthiness}/1000`} />
          </div>
          <div className="mt-6">
            <div className="text-xs opacity-80 uppercase tracking-wider mb-2">Approval Confidence</div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${result.probability}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4 text-primary" /> Model Ensemble</CardTitle>
          <CardDescription>Verdict from every trained model</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.modelBreakdown.map((m) => (
            <div key={m.model} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{m.model}</span>
                <Badge variant={m.verdict === "Approve" ? "default" : "destructive"} className={m.verdict === "Approve" ? "bg-success text-success-foreground" : ""}>{m.verdict}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={m.probability} className="h-1.5" />
                <span className="text-xs text-muted-foreground w-10 text-right">{m.probability}%</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Top Contributing Factors</CardTitle>
          <CardDescription>Ranked by absolute impact on the decision</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.topFactors.map((f) => (
            <div key={f.name} className="flex items-center gap-4">
              <div className="w-40 text-sm font-medium truncate">{f.name}</div>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden relative">
                <div className={`absolute top-0 h-full ${f.positive ? "bg-success left-1/2" : "bg-destructive right-1/2"} rounded-full`} style={{ width: `${Math.min(50, Math.abs(f.impact) * 25)}%` }} />
                <div className="absolute top-0 left-1/2 h-full w-px bg-border" />
              </div>
              <div className={`text-xs font-mono w-14 text-right ${f.positive ? "text-success" : "text-destructive"}`}>{f.positive ? "+" : ""}{f.impact}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning-foreground" /> {approved ? "Keep Improving" : "Improvement Suggestions"}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {result.suggestions.map((s, i) => (
              <li key={i} className="flex gap-2"><span className="text-primary">•</span> {s}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs opacity-80 uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
