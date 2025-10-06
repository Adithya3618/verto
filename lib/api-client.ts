import type {
  User,
  Board,
  BoardWithMembers,
  List,
  ListWithCards,
  Card,
  CardWithDetails,
  Comment,
  Invite,
} from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// Helper function for API requests
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

// Auth API
export const authApi = {
  signup: (data: { email: string; username: string; password: string; full_name?: string }) =>
    request<{ user: User; token: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () =>
    request<{ message: string }>("/auth/logout", {
      method: "POST",
    }),

  getCurrentUser: () => request<User>("/auth/me"),
}

// Boards API
export const boardsApi = {
  getAll: () => request<Board[]>("/boards"),

  getById: (id: number) => request<BoardWithMembers>(`/boards/${id}`),

  create: (data: { title: string; description?: string; background_color?: string }) =>
    request<Board>("/boards", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Board>) =>
    request<Board>(`/boards/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/boards/${id}`, {
      method: "DELETE",
    }),
}

// Lists API
export const listsApi = {
  getByBoard: (boardId: number) => request<ListWithCards[]>(`/boards/${boardId}/lists`),

  create: (data: { board_id: number; title: string; position: number }) =>
    request<List>("/lists", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<List>) =>
    request<List>(`/lists/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/lists/${id}`, {
      method: "DELETE",
    }),
}

// Cards API
export const cardsApi = {
  getById: (id: number) => request<CardWithDetails>(`/cards/${id}`),

  create: (data: { list_id: number; title: string; position: number; description?: string }) =>
    request<Card>("/cards", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Card>) =>
    request<Card>(`/cards/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/cards/${id}`, {
      method: "DELETE",
    }),

  move: (id: number, data: { list_id: number; position: number }) =>
    request<Card>(`/cards/${id}/move`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
}

// Comments API
export const commentsApi = {
  create: (data: { card_id: number; content: string }) =>
    request<Comment>("/comments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, content: string) =>
    request<Comment>(`/comments/${id}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/comments/${id}`, {
      method: "DELETE",
    }),
}

// Invites API
export const invitesApi = {
  create: (data: { board_id: number; email: string }) =>
    request<Invite>("/invites", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  accept: (token: string) =>
    request<{ message: string }>(`/invites/${token}/accept`, {
      method: "POST",
    }),

  getByBoard: (boardId: number) => request<Invite[]>(`/boards/${boardId}/invites`),
}

// Board Members API
export const boardMembersApi = {
  getByBoard: (boardId: number) => request<any[]>(`/boards/${boardId}/members`),

  invite: (boardId: number, data: { email: string; role: "member" | "admin" }) =>
    request<any>(`/boards/${boardId}/members`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  remove: (memberId: number) =>
    request<{ message: string }>(`/members/${memberId}`, {
      method: "DELETE",
    }),

  updateRole: (memberId: number, role: "member" | "admin") =>
    request<any>(`/members/${memberId}`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),
}

// Card Assignees API
export const cardAssigneesApi = {
  assign: (cardId: number, userId: number) =>
    request<any>(`/cards/${cardId}/assignees`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    }),

  remove: (assigneeId: number) =>
    request<{ message: string }>(`/assignees/${assigneeId}`, {
      method: "DELETE",
    }),
}
