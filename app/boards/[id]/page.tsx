"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { BoardList } from "@/components/board-list"
import { AddListButton } from "@/components/add-list-button"
import { BoardMembersDialog } from "@/components/board-members-dialog"
import { Button } from "@/components/ui/button"
import { boardsApi, listsApi } from "@/lib/api-client"
import type { BoardWithMembers, ListWithCards } from "@/lib/types"
import { Loader2, ArrowLeft, Settings } from "lucide-react"
import Link from "next/link"

export default function BoardPage() {
  const router = useRouter()
  const params = useParams()
  const boardId = Number(params.id)
  const { user, loading: authLoading } = useAuth()
  const [board, setBoard] = useState<BoardWithMembers | null>(null)
  const [lists, setLists] = useState<ListWithCards[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && boardId) {
      loadBoard()
    }
  }, [user, boardId])

  const loadBoard = async () => {
    try {
      const [boardData, listsData] = await Promise.all([boardsApi.getById(boardId), listsApi.getByBoard(boardId)])
      setBoard(boardData)
      setLists(listsData)
    } catch (error) {
      console.error("Failed to load board:", error)
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  // Function to update a specific card in the lists state
  const updateCardInList = (cardId: number, updatedCard: any) => {
    setLists(prevLists =>
      prevLists.map(list => ({
        ...list,
        cards: list.cards.map(card =>
          card.id === cardId ? { ...card, ...updatedCard } : card
        )
      }))
    )
  }

  if (authLoading || loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!board) {
    return null
  }

  return (
    <div className="flex h-screen flex-col">
      <Navbar />

      {/* Board Header */}
      <div
        className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        style={{
          backgroundColor: board.background_color + "20",
        }}
      >
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold">{board.title}</h1>
            {board.description && <p className="hidden md:block text-sm text-muted-foreground">{board.description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <BoardMembersDialog boardId={boardId} />
            <Link href={`/boards/${boardId}/settings`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div
        className="flex-1 overflow-x-auto overflow-y-hidden"
        style={{
          backgroundColor: board.background_color,
        }}
      >
        <div className="flex h-full gap-4 p-4">
          {lists.map((list) => (
            <BoardList
              key={list.id}
              list={list}
              cards={list.cards}
              onUpdate={loadBoard}
              boardId={boardId}
              onUpdateCard={updateCardInList}
            />
          ))}
          <AddListButton boardId={boardId} listCount={lists.length} onUpdate={loadBoard} />
        </div>
      </div>
    </div>
  )
}
