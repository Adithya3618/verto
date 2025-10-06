// Database types
export interface User {
  id: number
  email: string
  username: string
  password_hash: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Board {
  id: number
  title: string
  description: string | null
  background_color: string
  owner_id: number
  created_at: string
  updated_at: string
}

export interface BoardMember {
  id: number
  board_id: number
  user_id: number
  role: "owner" | "member"
  joined_at: string
}

export interface List {
  id: number
  board_id: number
  title: string
  position: number
  created_at: string
  updated_at: string
}

export interface Card {
  id: number
  list_id: number
  title: string
  description: string | null
  position: number
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface CardAssignee {
  id: number
  card_id: number
  user_id: number
  assigned_at: string
}

export interface Comment {
  id: number
  card_id: number
  user_id: number
  content: string
  created_at: string
  updated_at: string
}

export interface Invite {
  id: number
  board_id: number
  email: string
  token: string
  invited_by: number
  status: "pending" | "accepted" | "expired"
  created_at: string
  expires_at: string
}

// Extended types with relations
export interface BoardWithMembers extends Board {
  members: (BoardMember & { user: User })[]
}

export interface ListWithCards extends List {
  cards: Card[]
}

export interface CardWithDetails extends Card {
  assignees: (CardAssignee & { user: User })[]
  comments: (Comment & { user: User })[]
}
