import type { Database } from "better-sqlite3"

// Database connection utility
const db: Database | null = null

export function getDb(): Database {
  if (!db) {
    // In a real app, this would connect to your SQLite database
    // For now, we'll create a placeholder that your Python backend will handle
    throw new Error("Database connection should be handled by the Python backend")
  }
  return db
}

// API client for communicating with Python backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include", // Include cookies for session management
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}
