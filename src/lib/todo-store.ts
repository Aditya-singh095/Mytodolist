import type { Todo } from "@/types/todo";

const STORAGE_KEY = "mytodolist.todos.v1";
const SERVER_SNAPSHOT: Todo[] = [];

type Listener = () => void;

const listeners = new Set<Listener>();
let cachedRaw: string | null = null;
let cachedTodos: Todo[] = SERVER_SNAPSHOT;
let storageListenerAttached = false;

function isValidTodo(value: unknown): value is Todo {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.completed === "boolean" &&
    typeof item.createdAt === "number"
  );
}

function parseTodos(raw: string | null): Todo[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidTodo);
  } catch {
    return [];
  }
}

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

function writeTodos(nextTodos: Todo[]): void {
  const serialized = JSON.stringify(nextTodos);
  cachedRaw = serialized;
  cachedTodos = nextTodos;
  try {
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // Ignore storage quota or private-browsing write errors; in-memory cache stays updated.
  }
  notify();
}

export function getTodosSnapshot(): Todo[] {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedTodos = parseTodos(raw);
    }
  } catch {
    return cachedTodos;
  }
  return cachedTodos;
}

export function getTodosServerSnapshot(): Todo[] {
  return SERVER_SNAPSHOT;
}

export function subscribeTodos(listener: Listener): () => void {
  listeners.add(listener);

  if (typeof window !== "undefined" && !storageListenerAttached) {
    storageListenerAttached = true;
    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY) {
        cachedRaw = event.newValue;
        cachedTodos = parseTodos(event.newValue);
        notify();
      }
    });
  }

  return () => {
    listeners.delete(listener);
  };
}

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function addTodo(title: string): void {
  const trimmed = title.trim();
  if (!trimmed) return;
  const current = getTodosSnapshot();
  const next: Todo = {
    id: generateId(),
    title: trimmed,
    completed: false,
    createdAt: Date.now(),
  };
  writeTodos([next, ...current]);
}

export function toggleTodo(id: string): void {
  const current = getTodosSnapshot();
  writeTodos(
    current.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    ),
  );
}

export function updateTodoTitle(id: string, title: string): void {
  const trimmed = title.trim();
  if (!trimmed) return;
  const current = getTodosSnapshot();
  writeTodos(
    current.map((todo) =>
      todo.id === id ? { ...todo, title: trimmed } : todo,
    ),
  );
}

export function deleteTodo(id: string): void {
  const current = getTodosSnapshot();
  writeTodos(current.filter((todo) => todo.id !== id));
}

export function clearCompletedTodos(): void {
  const current = getTodosSnapshot();
  writeTodos(current.filter((todo) => !todo.completed));
}
