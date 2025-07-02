export interface Item {
  id: string;
  title: string;
  date?: string;
  priority?: "high" | "medium" | "low";
  description?: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  title?: string;
  frequency: "daily" | "weekly" | "custom";
  customDays?: number;
  displayType: "icon" | "text";
  icon?: string;
  nextReminder: string; // ISO date string
  lastReminded?: string; // ISO date string
  status: "active" | "snoozed" | "completed" | "discarded";
  createdAt: string;
  completedCount: number;
  snoozeCount: number;
  discardedCount: number;
  reminderHour: number; // Hour of day (0-23) when reminder should appear
}
