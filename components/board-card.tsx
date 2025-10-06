"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { MoreHorizontal, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Board } from "@/lib/types"

interface BoardCardProps {
  board: Board
  onDelete?: (id: number) => void
}

export function BoardCard({ board, onDelete }: BoardCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/5">
      <Link href={`/boards/${board.id}`}>
        <div
          className="h-24 w-full"
          style={{
            backgroundColor: board.background_color,
          }}
        />
      </Link>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link href={`/boards/${board.id}`}>
              <h3 className="font-semibold truncate hover:text-primary transition-colors">{board.title}</h3>
            </Link>
            {board.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{board.description}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/boards/${board.id}`}>Open board</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/boards/${board.id}/settings`}>Settings</Link>
              </DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(board.id)}
                >
                  Delete board
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>Board</span>
        </div>
      </CardContent>
    </Card>
  )
}
