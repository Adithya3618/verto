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
import { Badge } from "@/components/ui/badge"
import { Users, Trash2, Crown, Loader2 } from "lucide-react"
import { boardMembersApi } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import type { BoardMember } from "@/lib/types"
import { InviteMemberDialog } from "./invite-member-dialog"

interface BoardMembersDialogProps {
  boardId: number
}

export function BoardMembersDialog({ boardId }: BoardMembersDialogProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [members, setMembers] = useState<BoardMember[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadMembers()
    }
  }, [open])

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

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm("Are you sure you want to remove this member?")) return

    try {
      await boardMembersApi.remove(memberId)
      await loadMembers()
    } catch (error) {
      console.error("Failed to remove member:", error)
    }
  }

  const currentUserMember = members.find((m) => m.user_id === user?.id)
  const isAdmin = currentUserMember?.role === "admin"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Members</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Board members</DialogTitle>
          <DialogDescription>Manage who has access to this board</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {members.map((member) => {
                const initials =
                  member.user.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || member.user.username.slice(0, 2).toUpperCase()

                return (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{member.user.full_name || member.user.username}</p>
                          {member.role === "admin" && <Crown className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.role === "admin" ? "default" : "secondary"}>{member.role}</Badge>
                      {isAdmin && member.user_id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {isAdmin && (
              <div className="pt-4 border-t">
                <InviteMemberDialog boardId={boardId} onUpdate={loadMembers} />
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
