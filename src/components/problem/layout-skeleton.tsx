import { Skeleton } from "../ui/skeleton";

export default function ProblemLayoutSkeleton() {
    return (
        <div className="grid grid-cols-2 h-lvh py-1 dark:bg-zinc-900">
            <div className="border-r h-full px-1">
            <Skeleton className="h-10 w-full px-1 flex items-center gap-3">
                <Skeleton className="h-7 w-[100px]"></Skeleton>
                <Skeleton className="h-7 w-[100px]"></Skeleton>
                <Skeleton className="h-7 w-[100px]"></Skeleton>
                <Skeleton className="h-7 w-[100px]"></Skeleton>
            </Skeleton>

            <Skeleton className="h-7 w-full mt-3"></Skeleton>
            <Skeleton className="h-7 w-1/2 mt-3"></Skeleton>
            <Skeleton className="h-[400px] mt-3"></Skeleton>
            <Skeleton className="h-7 w-full mt-3"></Skeleton>
            <Skeleton className="h-7 w-1/2 mt-3"></Skeleton>

            <Skeleton className="h-7 w-1/2 mt-3"></Skeleton>
            <Skeleton className="h-7 w-full mt-3"></Skeleton>
            </div>
            <div className="px-1">
            <Skeleton className="h-[400px] mt-3"></Skeleton>
            <Skeleton className="h-[250px] mt-3"></Skeleton>
            </div>
           
        </div>
    )
}