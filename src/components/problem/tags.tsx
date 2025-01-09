import { Badge } from "../ui/badge";

export default function ProblemTags({tags}) {
    return (
        <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag.id} variant="outline">
            {tag.name}
          </Badge>
        ))}
      </div>
    )
}