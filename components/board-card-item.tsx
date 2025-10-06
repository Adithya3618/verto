"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { CardDetailDialog } from "./card-detail-dialog"
import type { Card as CardType } from "@/lib/types"

interface BoardCardItemProps {
  card: CardType
  onUpdate?: () => void
}

export function BoardCardItem({ card, onUpdate }: BoardCardItemProps) {
  const [showDialog, setShowDialog] = useState(false)
  const hasDueDate = !!card.due_date
  const dueDate = card.due_date ? new Date(card.due_date) : null
  const isOverdue = dueDate && dueDate < new Date()

  return (
    <>
      <Card
        className="p-3 cursor-pointer transition-all hover:shadow-md hover:shadow-primary/5 hover:border-primary/20"
        onClick={() => setShowDialog(true)}
      >
        <h4 className="text-sm font-medium mb-2">{card.title}</h4>

        {card.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{card.description}</p>}

        <div className="flex items-center gap-2 flex-wrap">
          {hasDueDate && (
            <div
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                isOverdue ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
              }`}
            >
              <Calendar className="h-3 w-3" />
              <span>{dueDate?.toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </Card>

      <CardDetailDialog cardId={card.id} open={showDialog} onOpenChange={setShowDialog} onUpdate={onUpdate} />
    </>
  )
}
