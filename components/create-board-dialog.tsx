"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { boardsApi } from "@/lib/api-client"

const BOARD_COLORS = [
  "#0079bf", // Blue
  "#d29034", // Orange
  "#519839", // Green
  "#b04632", // Red
  "#89609e", // Purple
  "#cd5a91", // Pink
  "#4bbf6b", // Light Green
  "#00aecc", // Cyan
]

export function CreateBoardDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [backgroundColor, setBackgroundColor] = useState(BOARD_COLORS[0])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const board = await boardsApi.create({
        title,
        description: description || undefined,
        background_color: backgroundColor,
      })
      setOpen(false)
      setTitle("")
      setDescription("")
      setBackgroundColor(BOARD_COLORS[0])
      router.push(`/boards/${board.id}`)
    } catch (error) {
      console.error("Failed to create board:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create board
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new board</DialogTitle>
          <DialogDescription>Organize your tasks with a new board</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Board title</Label>
            <Input
              id="title"
              placeholder="My Project Board"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="What is this board about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Background color</Label>
            <div className="grid grid-cols-8 gap-2">
              {BOARD_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="h-10 w-10 rounded-md transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  style={{ backgroundColor: color }}
                  onClick={() => setBackgroundColor(color)}
                  disabled={loading}
                >
                  {backgroundColor === color && (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create board"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
