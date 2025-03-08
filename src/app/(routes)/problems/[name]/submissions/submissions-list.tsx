"use client";

import { dateFormatter, LANG, PColor } from "@/lib/others";
import { useProblem } from "@/providers/problem-provider";
import Link from "next/link";
import { useQuery } from "react-query";
import ProblemCommonSkeleton from "@/components/skeletons/problem-common-skeleton";
import NoData from "@/components/skeletons/not-data";
import { LuClock4 } from "react-icons/lu";
import { MdMemory } from "react-icons/md";

const getSubmissions = async (userId, problemId) => {
  try {
    const response = await fetch(`/api/submission/${userId}/${problemId}`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Failed to fetch users");
    return response.json();
  } catch (error) {
    console.error("Error posting submission:", error);
    throw error;
  }
};

const SubmissionList = ({ userId }) => {
  const { problem } = useProblem();

  const { data, isLoading, error } = useQuery({
    queryKey: ["submissions"],
    queryFn: () => getSubmissions(userId, problem?.id),
    enabled: !!problem?.id && !!userId,
    // cacheTime: 0,
    // staleTime: 0,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  if (isLoading) return <ProblemCommonSkeleton />;
  if (error) return <div>Error: something went wrong!</div>;
  if (data.length == 0) {
    return <NoData />;
  }
  return (
    <div>
      {data?.map((submission) => (
        <div key={submission.id} className="bg-muted">
          <Link href={`submissions/${submission.id}`}>
            {" "}
            <div className="p-3 mt-1 border grid grid-cols-4 items-center">
              <div>
                <h1
                  style={{ color: PColor[submission.status] }}
                  className="font-bold text-sm"
                >
                  {submission.status}
                </h1>
                <p className="text-xs">{dateFormatter(submission.date)} </p>
              </div>
              <div className="text-xs flex gap-1 items-center">
                {LANG[submission.language].icon}{" "}
                <span>{LANG[submission.language].name}</span>
              </div>
              <div className="text-xs">
                <p className="flex items-center gap-1">
                  <LuClock4 size={16} />
                  {submission.runtime} ms
                </p>
              </div>

              <div className="text-xs">
                <p className="flex items-center gap-1">
                  <MdMemory size={20} /> {submission.memory} kb
                </p>
              </div>

              {/* <div className="text-xs">
            <p>{submission.percentage.toFixed(0)}%</p>
          </div> */}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default SubmissionList;
