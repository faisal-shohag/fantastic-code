import { DifficultyLevel } from '@prisma/client'
import { Badge } from '../ui/badge'

const DifficultyBadge = ({ difficulty }: { difficulty: DifficultyLevel }) => {
  const colorMap = {
    EASY: 'bg-green-700',
    MEDIUM: 'bg-yellow-600',
    HARD: 'bg-red-500'
  }

  return (
    <Badge className={`${colorMap[difficulty]} text-white text-xs border`}>
      {difficulty}
    </Badge>
  )
}

export default DifficultyBadge