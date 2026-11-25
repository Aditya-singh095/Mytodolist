"use client";

import { type FormEvent, useState, useSyncExternalStore } from "react";
import { TodoItem } from "@/components/TodoItem";
import {
  addTodo,
  clearCompletedTodos,
  deleteTodo,
  getTodosServerSnapshot,
  getTodosSnapshot,
  subscribeTodos,
  toggleTodo,
  updateTodoTitle,
} from "@/lib/todo-store";
import type { TodoFilter } from "@/types/todo";

const FILTERS: { value: TodoFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

export function TodoApp() {
  const todos = useSyncExternalStore(
    subscribeTodos,
    getTodosSnapshot,
    getTodosServerSnapshot,
  );
  const [newTitle, setNewTitle] = useState("");
  const [filter, setFilter] = useState<TodoFilter>("all");

  const completedCount = todos.filter((todo) => todo.completed).length;
  const activeCount = todos.length - completedCount;
  const progressPercent =
    todos.length === 0 ? 0 : Math.round((completedCount / todos.length) * 100);

  const visibleTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTitle.trim()) return;
    addTodo(newTitle);
    setNewTitle("");
  }

  function getCountForFilter(value: TodoFilter): number {
    if (value === "active") return activeCount;
    if (value === "completed") return completedCount;
    return todos.length;
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:py-16">
      <div className="rounded-2xl border border-zinc-200/90 bg-white/95 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 sm:p-8">
        <header className="mb-6">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                My Todo List
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Keep track of what matters today.
              </p>
            </div>
            {todos.length > 0 && (
              <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                {completedCount}/{todos.length} done
              </span>
            )}
          </div>

          {todos.length > 0 && (
            <div
              className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Task completion progress"
            >
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-300 dark:bg-indigo-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </header>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <label htmlFor="new-todo-input" className="sr-only">
            Add a new task
          </label>
          <input
            id="new-todo-input"
            type="text"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="Add a new task..."
            className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-indigo-400 dark:focus:bg-zinc-950 sm:text-base"
          />
          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="shrink-0 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-xs transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            Add
          </button>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div
            role="tablist"
            aria-label="Filter tasks"
            className="inline-flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/80"
          >
            {FILTERS.map((item) => {
              const isSelected = filter === item.value;
              const count = getCountForFilter(item.value);
              return (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setFilter(item.value)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
                    isSelected
                      ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-50"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] leading-none ${
                      isSelected
                        ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        : "bg-zinc-200/70 text-zinc-600 dark:bg-zinc-700/60 dark:text-zinc-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {completedCount > 0 && (
            <button
              type="button"
              onClick={clearCompletedTodos}
              className="text-xs font-medium text-zinc-500 transition hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 sm:text-sm"
            >
              Clear completed
            </button>
          )}
        </div>

        <section aria-label="Tasks" className="mt-4">
          {visibleTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-12 text-center dark:border-zinc-800">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                {todos.length === 0
                  ? "No tasks yet"
                  : filter === "active"
                    ? "All tasks are completed!"
                    : "No completed tasks yet"}
              </p>
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                {todos.length === 0
                  ? "Type a task above and press Enter to get started."
                  : "Switch filters or add a new task above."}
              </p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {visibleTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onUpdate={updateTodoTitle}
                  onDelete={deleteTodo}
                />
              ))}
            </ul>
          )}
        </section>

        {todos.length > 0 && (
          <footer className="mt-5 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
            <span>
              {activeCount} {activeCount === 1 ? "item" : "items"} left
            </span>
            <span>Double-click a task to edit</span>
          </footer>
        )}
      </div>
    </div>
  );
}
