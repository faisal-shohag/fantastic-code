import { DifficultyLevel } from '@prisma/client'
import { Badge } from '../ui/badge'

const DifficultyBadge = ({ difficulty }: { difficulty: DifficultyLevel }) => {
  const colorMap = {
    EASY: 'bg-green-500',
    MEDIUM: 'bg-yellow-500',
    HARD: 'bg-red-500'
  }

  return (
    <Badge className={`${colorMap[difficulty]} text-white`}>
      {difficulty}
    </Badge>
  )
}

export default DifficultyBadge