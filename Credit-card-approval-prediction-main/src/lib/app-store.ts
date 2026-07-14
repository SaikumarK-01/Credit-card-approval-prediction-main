import type { ApplicantInput, PredictionResult } from "./ml-model";

export type ApplicationRecord = {
  id: string;
  name: string;
  createdAt: string;
  input: ApplicantInput;
  result: PredictionResult;
};

const KEY = "cc_applications_v1";

export function loadApplications(): ApplicationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveApplication(rec: ApplicationRecord) {
  if (typeof window === "undefined") return;
  const list = loadApplications();
  list.unshift(rec);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 500)));
  window.dispatchEvent(new Event("cc_applications_changed"));
}

export function deleteApplication(id: string) {
  const list = loadApplications().filter((r) => r.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("cc_applications_changed"));
}

export function clearApplications() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("cc_applications_changed"));
}

export function seedDemoData(fn: (input: ApplicantInput) => PredictionResult) {
  if (loadApplications().length > 0) return;
  const rand = (min: number, max: number) => Math.round(min + Math.random() * (max - min));
  const names = ["Aditi Sharma","Ravi Kumar","Emma Wilson","Liam Chen","Priya Patel","Noah Martinez","Sofia Rossi","Yuki Tanaka","Omar Hassan","Grace Kim","David Park","Fatima Ali","Lucas Silva","Chloe Dubois","Arjun Mehta","Isabella Costa"];
  const list: ApplicationRecord[] = [];
  const now = Date.now();
  for (let i = 0; i < 24; i++) {
    const input: ApplicantInput = {
      gender: Math.random() > 0.5 ? "male" : "female",
      age: rand(22, 62),
      maritalStatus: ["single","married","divorced"][rand(0,2)],
      education: ["highschool","bachelors","masters","phd"][rand(0,3)],
      employmentType: ["salaried","self-employed","business","unemployed"][rand(0,3)],
      yearsEmployed: rand(0, 25),
      occupation: "Professional",
      annualIncome: rand(20000, 200000),
      monthlyIncome: rand(2000, 16000),
      existingLoan: rand(0, 80000),
      creditLimit: rand(1000, 50000),
      creditInquiries: rand(0, 8),
      debtRatio: Math.round(Math.random() * 80) / 100,
      creditScore: rand(450, 830),
      previousDefaults: rand(0, 3),
      repaymentStatus: ["excellent","good","fair","poor"][rand(0,3)],
      pastDuePayments: rand(0, 4),
    };
    const result = fn(input);
    list.push({
      id: crypto.randomUUID(),
      name: names[i % names.length],
      createdAt: new Date(now - i * 86400000 * (0.5 + Math.random())).toISOString(),
      input,
      result,
    });
  }
  localStorage.setItem(KEY, JSON.stringify(list));
}
