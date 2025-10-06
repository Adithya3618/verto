"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { AssignMemberDialog } from "@/components/assign-member-dialog"
import { ArrowLeft, Calendar, Loader2, Trash2, User } from "lucide-react"
import { cardsApi, commentsApi } from "@/lib/api-client"
import type { CardWithDetails } from "@/lib/types"

export default function CardPage() {
  const router = useRouter()
  const params = useParams()
  const cardId = Number(params.id)
  const { user, loading: authLoading } = useAuth()
  const [card, setCard] = useState<CardWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [editedTitle, setEditedTitle] = useState("")
  const [editedDescription, setEditedDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [newComment, setNewComment] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && cardId) {
      loadCard()
    }
  }, [user, cardId])

  const loadCard = async () => {
    setLoading(true)
    try {
      const data = await cardsApi.getById(cardId)
      setCard(data)
      setEditedTitle(data.title)
      setEditedDescription(data.description || "")
      setDueDate(data.due_date ? data.due_date.split("T")[0] : "")
    } catch (error) {
      console.error("Failed to load card:", error)
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!card) return

    setSaving(true)
    try {
      await cardsApi.update(card.id, {
        title: editedTitle,
        description: editedDescription || null,
        due_date: dueDate || null,
      })
      await loadCard()
    } catch (error) {
      console.error("Failed to update card:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!card || !confirm("Are you sure you want to delete this card?")) return

    try {
      await cardsApi.delete(card.id)
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to delete card:", error)
    }
  }

  const handleAddComment = async () => {
    if (!card || !newComment.trim()) return

    setSaving(true)
    try {
      await commentsApi.create({
        card_id: card.id,
        content: newComment,
      })
      setNewComment("")
      await loadCard()
    } catch (error) {
      console.error("Failed to add comment:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      await commentsApi.delete(commentId)
      await loadCard()
    } catch (error) {
      console.error("Failed to delete comment:", error)
    }
  }

  if (authLoading || loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!card) return null

  const userInitials =
    user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ||
    user?.username?.slice(0, 2).toUpperCase() ||
    "U"

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to board
          </Button>
          <h1 className="text-3xl font-bold">{card.title}</h1>
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} disabled={saving} />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="Add a more detailed description..."
              rows={6}
              disabled={saving}
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due Date
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={saving}
              className="max-w-xs"
            />
          </div>

          {/* Assignees */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Assignees
            </Label>
            <div className="flex items-center gap-2 flex-wrap">
              {card.assignees.length > 0 ? (
                card.assignees.map((assignee) => (
                  <div key={assignee.id} className="flex items-center gap-2 bg-muted px-3 py-2 rounded-md">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {assignee.user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{assignee.user.username}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No assignees yet</p>
              )}
              <AssignMemberDialog
                cardId={card.id}
                boardId={card.list.board_id}
                currentAssignees={card.assignees}
                onUpdate={loadCard}
              />
            </div>
          </div>

          {/* Save/Delete Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete card
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>

          {/* Comments Section */}
          <div className="space-y-4 pt-6 border-t">
            <h2 className="text-xl font-semibold">Comments</h2>

            {/* Add Comment */}
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  disabled={saving}
                />
                <Button size="sm" onClick={handleAddComment} disabled={saving || !newComment.trim()}>
                  Add comment
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {card.comments.length > 0 ? (
                card.comments.map((comment) => (
                  <Card key={comment.id} className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {comment.user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{comment.user.username}</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(comment.created_at).toLocaleString()}
                            </span>
                          </div>
                          {comment.user_id === user?.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
