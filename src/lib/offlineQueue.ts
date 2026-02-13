const QUEUE_KEY = "aramis_offline_queue";

interface QueuedMutation {
  id: string;
  table: string;
  type: "insert" | "update" | "delete";
  data: Record<string, unknown>;
  timestamp: number;
}

export function getQueue(): QueuedMutation[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToQueue(mutation: Omit<QueuedMutation, "id" | "timestamp">) {
  const queue = getQueue();
  queue.push({ ...mutation, id: crypto.randomUUID(), timestamp: Date.now() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function clearQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

export function isOnline(): boolean {
  return navigator.onLine;
}
