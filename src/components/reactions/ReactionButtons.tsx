import { Heart, Flame, Sparkles, Lightbulb, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useReactions, ReactionType } from '@/hooks/useReactions'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ReactionButtonsProps {
  storyId: string
  className?: string
}

const reactionConfig = {
  love: { icon: Heart, label: 'Love', color: 'text-red-500 hover:bg-red-50' },
  fire: { icon: Flame, label: 'Amazing', color: 'text-orange-500 hover:bg-orange-50' },
  touching: { icon: Smile, label: 'Touching', color: 'text-blue-500 hover:bg-blue-50' },
  inspiring: { icon: Sparkles, label: 'Inspiring', color: 'text-purple-500 hover:bg-purple-50' },
  insightful: { icon: Lightbulb, label: 'Insightful', color: 'text-yellow-500 hover:bg-yellow-50' },
}

export const ReactionButtons = ({ storyId, className }: ReactionButtonsProps) => {
  const { reactions, userReactions, toggleReaction, loading } = useReactions(storyId)

  if (loading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {Object.keys(reactionConfig).map((key) => (
          <div key={key} className="h-9 w-16 animate-pulse bg-muted rounded-md" />
        ))}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={cn('flex flex-wrap items-center gap-2', className)}>
        {Object.entries(reactionConfig).map(([type, config]) => {
          const Icon = config.icon
          const count = reactions[type as ReactionType]
          const hasReacted = userReactions.has(type as ReactionType)

          return (
            <Tooltip key={type}>
              <TooltipTrigger asChild>
                <Button
                  variant={hasReacted ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => toggleReaction(type as ReactionType)}
                  className={cn(
                    'gap-1.5 transition-all duration-200 hover:scale-105',
                    hasReacted && 'shadow-sm',
                    config.color
                  )}
                >
                  <Icon className={cn('h-4 w-4', hasReacted && 'fill-current')} />
                  {count > 0 && (
                    <span className="text-xs font-medium">{count}</span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{config.label}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}