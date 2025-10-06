"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { UserPlus, Loader2 } from "lucide-react"
import { boardMembersApi, cardAssigneesApi } from "@/lib/api-client"
import type { BoardMember, CardAssignee } from "@/lib/types"

interface AssignMemberDialogProps {
  cardId: number
  boardId: number
  currentAssignees: CardAssignee[]
  onUpdate: () => void
}

export function AssignMemberDialog({ cardId, boardId, currentAssignees, onUpdate }: AssignMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [members, setMembers] = useState<BoardMember[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      loadMembers()
      setSelectedUserIds(currentAssignees.map((a) => a.user_id))
    }
  }, [open, currentAssignees])

  const loadMembers = async () => {
    setLoading(true)
    try {
      const data = await boardMembersApi.getByBoard(boardId)
      setMembers(data)
    } catch (error) {
      console.error("Failed to load members:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleMember = (userId: number) => {
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Remove unselected assignees
      const toRemove = currentAssignees.filter((a) => !selectedUserIds.includes(a.user_id))
      for (const assignee of toRemove) {
        await cardAssigneesApi.remove(assignee.id)
      }

      // Add new assignees
      const currentUserIds = currentAssignees.map((a) => a.user_id)
      const toAdd = selectedUserIds.filter((id) => !currentUserIds.includes(id))
      for (const userId of toAdd) {
        await cardAssigneesApi.assign(cardId, userId)
      }

      setOpen(false)
      onUpdate()
    } catch (error) {
      console.error("Failed to update assignees:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <UserPlus className="h-4 w-4" />
          Assign members
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign members</DialogTitle>
          <DialogDescription>Select members to assign to this card</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {members.map((member) => {
                const initials =
                  member.user.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || member.user.username.slice(0, 2).toUpperCase()

                const isSelected = selectedUserIds.includes(member.user_id)

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                    onClick={() => handleToggleMember(member.user_id)}
                  >
                    <Checkbox checked={isSelected} onCheckedChange={() => handleToggleMember(member.user_id)} />
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{member.user.full_name || member.user.username}</p>
                      <p className="text-xs text-muted-foreground">{member.user.email}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
