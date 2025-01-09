"use client";
import { useProblem } from "@/providers/problem-provider";
import MarkdownView from "@/components/problem/markdown-view";
import SingleProblemSkeleton from "@/components/problem/single-skeleton";
import ProblemError from "@/components/problem/error";
import DifficultyBadge from "@/components/problem/difficultyBadge";
import ProblemTags from "@/components/problem/tags";

export default function ProblemPage() {
  const { problem, isLoading, error } = useProblem();
  if (isLoading) return <SingleProblemSkeleton />;
  if (error || !problem) return <ProblemError />;

  return (
    <div className="h-full overflow-y-auto pb-20 px-5 pt-3">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{problem.title}</h1>
        <DifficultyBadge difficulty={problem.difficulty} />
        <ProblemTags tags={problem.tags}/>
      </div>

      <div className="mt-3">
        <MarkdownView content={problem.description} />
      </div>
    </div>
  );
}
