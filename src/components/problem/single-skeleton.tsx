import { Skeleton } from "../ui/skeleton";

export default function SingleProblemSkeleton() {
    return (
      <Skeleton>
        <div className="h-full overflow-y-auto pb-20 px-5 pt-3">
          <div className="space-y-2">
            <Skeleton className="h-8 w-[300px]" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-[100px]" />
              <Skeleton className="h-8 w-[100px]" />
              <Skeleton className="h-8 w-[100px]" />
            </div>
        </div>
        </div>
      </Skeleton>
      )
}