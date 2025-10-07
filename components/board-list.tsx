"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Plus, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BoardCardItem } from "./board-card-item"
import type { List, Card as CardType } from "@/lib/types"
import { listsApi, cardsApi } from "@/lib/api-client"

interface BoardListProps {
  list: List
  cards: CardType[]
  onUpdate: () => void
  boardId?: number
  onUpdateCard?: (cardId: number, updatedCard: any) => void
}

export function BoardList({ list, cards, onUpdate, boardId, onUpdateCard }: BoardListProps) {
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState("")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState(list.title)
  const [loading, setLoading] = useState(false)

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return

    setLoading(true)
    try {
      await cardsApi.create({
        list_id: list.id,
        title: newCardTitle,
        position: cards.length,
      })
      setNewCardTitle("")
      setIsAddingCard(false)
      onUpdate()
    } catch (error) {
      console.error("Failed to create card:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTitle = async () => {
    if (!editedTitle.trim() || editedTitle === list.title) {
      setIsEditingTitle(false)
      setEditedTitle(list.title)
      return
    }

    setLoading(true)
    try {
      await listsApi.update(list.id, { title: editedTitle })
      setIsEditingTitle(false)
      onUpdate()
    } catch (error) {
      console.error("Failed to update list:", error)
      setEditedTitle(list.title)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteList = async () => {
    if (!confirm("Are you sure you want to delete this list and all its cards?")) return

    try {
      await listsApi.delete(list.id)
      onUpdate()
    } catch (error) {
      console.error("Failed to delete list:", error)
    }
  }

  return (
    <div className="flex h-full w-72 flex-shrink-0 flex-col">
      <Card className="flex h-full flex-col bg-muted/50">
        {/* List Header */}
        <div className="flex items-center justify-between gap-2 p-3 border-b border-border/50">
          {isEditingTitle ? (
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleUpdateTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUpdateTitle()
                if (e.key === "Escape") {
                  setIsEditingTitle(false)
                  setEditedTitle(list.title)
                }
              }}
              className="h-8 text-sm font-semibold"
              autoFocus
              disabled={loading}
            />
          ) : (
            <h3
              className="flex-1 text-sm font-semibold cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
              onClick={() => setIsEditingTitle(true)}
            >
              {list.title}
            </h3>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsAddingCard(true)}>Add card</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>Rename list</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDeleteList}>
                Delete list
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Cards */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {cards.map((card) => (
            <BoardCardItem
              key={card.id}
              card={card}
              boardId={list.board_id}
              onUpdateCard={onUpdateCard}
            />
          ))}

          {/* Add Card Form */}
          {isAddingCard && (
            <div className="space-y-2">
              <Input
                placeholder="Enter card title..."
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddCard()
                  if (e.key === "Escape") {
                    setIsAddingCard(false)
                    setNewCardTitle("")
                  }
                }}
                className="text-sm"
                autoFocus
                disabled={loading}
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleAddCard} disabled={loading || !newCardTitle.trim()}>
                  Add card
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsAddingCard(false)
                    setNewCardTitle("")
                  }}
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Add Card Button */}
        {!isAddingCard && (
          <div className="p-2 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => setIsAddingCard(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add a card
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
