import { getBadgeInfo, Achievement } from '@/hooks/useAchievements'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface AchievementBadgeProps {
  achievement: Achievement
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export const AchievementBadge = ({ achievement, size = 'md', showLabel = false }: AchievementBadgeProps) => {
  const badgeInfo = getBadgeInfo(achievement.badge_type)
  
  const sizeClasses = {
    sm: 'h-8 w-8 text-lg',
    md: 'h-12 w-12 text-2xl',
    lg: 'h-16 w-16 text-3xl',
  }

  const tierColors = {
    bronze: 'from-amber-600 to-amber-800 border-amber-700',
    silver: 'from-gray-300 to-gray-500 border-gray-400',
    gold: 'from-yellow-400 to-yellow-600 border-yellow-500',
    platinum: 'from-blue-300 to-purple-400 border-purple-300',
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'rounded-full bg-gradient-to-br flex items-center justify-center border-2 shadow-lg animate-scale-in',
                sizeClasses[size],
                tierColors[achievement.badge_tier]
              )}
            >
              <span>{badgeInfo.icon}</span>
            </div>
            {showLabel && (
              <div className="text-left">
                <div className="font-semibold text-sm">{badgeInfo.name}</div>
                <Badge variant="secondary" className="text-xs capitalize">
                  {achievement.badge_tier}
                </Badge>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{badgeInfo.name}</p>
            <p className="text-sm text-muted-foreground">{badgeInfo.description}</p>
            <p className="text-xs text-muted-foreground">
              Earned {new Date(achievement.earned_at).toLocaleDateString()}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}