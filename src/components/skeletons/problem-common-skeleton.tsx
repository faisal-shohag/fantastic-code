import { Skeleton } from "../ui/skeleton";

const ProblemCommonSkeleton = () => {
    return (
        <div>
            {
                Array.from({ length: 10 }).map((_, index) => (
                    <Skeleton key={index} className="bg-muted items-center grid grid-cols-4 p-3 mt-1 rounded-none border">
                <div className="">
                    <Skeleton className="h-5 w-24"></Skeleton>
                    <Skeleton className="h-3 w-20 mt-1"></Skeleton>
                </div>

                <Skeleton className="h-8 w-24"></Skeleton>

                <Skeleton className="h-8 w-24"></Skeleton>
                <Skeleton className="h-8 w-24"></Skeleton>
                
            </Skeleton>
                ))
            }
        </div>
    );
};

export default ProblemCommonSkeleton;