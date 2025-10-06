"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, X } from "lucide-react"
import { listsApi } from "@/lib/api-client"

interface AddListButtonProps {
  boardId: number
  listCount: number
  onUpdate: () => void
}

export function AddListButton({ boardId, listCount, onUpdate }: AddListButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!title.trim()) return

    setLoading(true)
    try {
      await listsApi.create({
        board_id: boardId,
        title,
        position: listCount,
      })
      setTitle("")
      setIsAdding(false)
      onUpdate()
    } catch (error) {
      console.error("Failed to create list:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAdding) {
    return (
      <div className="flex h-full w-72 flex-shrink-0">
        <Button
          variant="ghost"
          className="w-full justify-start bg-background/50 hover:bg-background/80 backdrop-blur"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add a list
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full w-72 flex-shrink-0">
      <Card className="w-full p-3 bg-muted/50">
        <Input
          placeholder="Enter list title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd()
            if (e.key === "Escape") {
              setIsAdding(false)
              setTitle("")
            }
          }}
          className="mb-2"
          autoFocus
          disabled={loading}
        />
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleAdd} disabled={loading || !title.trim()}>
            Add list
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsAdding(false)
              setTitle("")
            }}
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
