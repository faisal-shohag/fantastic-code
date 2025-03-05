"use client"

import { Badge } from "@/components/ui/badge";
import { dateFormatter, PColor } from "@/lib/others";
import { useProblem } from "@/providers/problem-provider";
import { useQuery } from "react-query";




const getSubmissions = async (userId, problemId) => {
    try {
    const response = await fetch(`/api/submission/${userId}/${problemId}`);
    if (!response.ok) throw new Error("Failed to fetch users");
    return response.json();
    } catch (error) {
        console.error("Error posting submission:", error);
        throw error;
    }
}
const SubmissionList =  ({userId}) => {
      const { problem } = useProblem();

    const {data, isLoading, error} = useQuery({
        queryKey: ['submissions'],
        queryFn: () => getSubmissions(userId, problem?.id)
    })

    if(isLoading) return <div>Loading...</div>
    if(error) return <div>Error: something went wrong!</div>
    if(data.length==0) {return <div>No submissions yet!</div>}
    return (
        <div>
                {data?.map((submission) => (
                   <div key={submission.id} className="p-3 border grid grid-cols-3 items-center"  >
                    <div>
                    <h1 style={{ color: PColor[submission.status] }} className="font-bold text-sm">{submission.status}</h1>
                    <p className="text-xs">{dateFormatter(submission.date)} </p>
                    </div>
                    <div className="text-xs">
                        <Badge className="dark:bg-zinc-500 dark:text-zinc-100"> {submission.language}</Badge>
                    </div>
                    <div className="text-xs">
                        <p>{submission.runtime} ms</p>
                    </div>
                   </div>
                ))}
            
        </div>
    );
};

export default SubmissionList;