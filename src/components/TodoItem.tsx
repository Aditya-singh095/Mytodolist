"use client";

import { useEffect, useRef, useState } from "react";
import type { Todo } from "@/types/todo";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({
  todo,
  onToggle,
  onUpdate,
  onDelete,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function startEditing() {
    setDraft(todo.title);
    setIsEditing(true);
  }

  function commitEdit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== todo.title) {
      onUpdate(todo.id, trimmed);
    } else {
      setDraft(todo.title);
    }
    setIsEditing(false);
  }

  function cancelEdit() {
    setDraft(todo.title);
    setIsEditing(false);
  }

  return (
    <li className="group flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-white px-4 py-3 shadow-xs transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/90 dark:hover:border-zinc-700">
      <button
        type="button"
        role="checkbox"
        aria-checked={todo.completed}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? "active" : "completed"}`}
        onClick={() => onToggle(todo.id)}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
          todo.completed
            ? "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-500"
            : "border-zinc-300 bg-white hover:border-indigo-500 dark:border-zinc-600 dark:bg-zinc-950 dark:hover:border-indigo-400"
        }`}
      >
        {todo.completed && (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path
              d="M3.5 8.5L6.5 11.5L12.5 4.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitEdit}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                commitEdit();
              } else if (event.key === "Escape") {
                cancelEdit();
              }
            }}
            aria-label="Edit task title"
            className="w-full rounded-md border border-indigo-500 bg-zinc-50 px-2 py-0.5 text-sm text-zinc-900 outline-none dark:bg-zinc-950 dark:text-zinc-100"
          />
        ) : (
          <span
            onDoubleClick={startEditing}
            title="Double-click to edit"
            className={`block cursor-text truncate text-sm transition sm:text-base ${
              todo.completed
                ? "text-zinc-400 line-through dark:text-zinc-500"
                : "text-zinc-800 dark:text-zinc-100"
            }`}
          >
            {todo.title}
          </span>
        )}
      </div>

      {!isEditing && (
        <div className="flex shrink-0 items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button
            type="button"
            onClick={startEditing}
            aria-label={`Edit "${todo.title}"`}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                d="M13.586 3.586a2 2 0 112.828 2.828l-8.5 8.5L4 16l1.086-3.914 8.5-8.5z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => onDelete(todo.id)}
            aria-label={`Delete "${todo.title}"`}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                d="M6 6l8 8M14 6l-8 8"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}
    </li>
  );
}
