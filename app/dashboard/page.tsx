"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { BoardCard } from "@/components/board-card"
import { CreateBoardDialog } from "@/components/create-board-dialog"
import { boardsApi } from "@/lib/api-client"
import type { Board } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { Layers } from "lucide-react" // Import Layers here

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadBoards()
    }
  }, [user])

  const loadBoards = async () => {
    try {
      const data = await boardsApi.getAll()
      setBoards(data)
    } catch (error) {
      console.error("Failed to load boards:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBoard = async (id: number) => {
    if (!confirm("Are you sure you want to delete this board?")) return

    try {
      await boardsApi.delete(id)
      setBoards(boards.filter((b) => b.id !== id))
    } catch (error) {
      console.error("Failed to delete board:", error)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your boards</h1>
            <p className="text-muted-foreground mt-1">Manage and organize your projects</p>
          </div>
          <CreateBoardDialog />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Layers className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No boards yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first board to start organizing your tasks and collaborating with your team.
            </p>
            <CreateBoardDialog />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {boards.map((board) => (
              <BoardCard key={board.id} board={board} onDelete={handleDeleteBoard} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
