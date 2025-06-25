export interface Item {
  id: string;
  title: string;
  date?: string;
  priority?: "high" | "medium" | "low";
  description?: string;
  createdAt: string;
}
