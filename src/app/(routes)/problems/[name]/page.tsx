"use client";
import { useProblem } from "@/providers/problem-provider";
import MarkdownView from "@/components/problem/markdown-view";
import SingleProblemSkeleton from "@/components/problem/single-skeleton";
import ProblemError from "@/components/problem/error";
import DifficultyBadge from "@/components/problem/difficultyBadge";
import ProblemTags from "@/components/problem/tags";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FaLightbulb } from "react-icons/fa6";

export default function ProblemPage() {
  const { problem, isLoading, error } = useProblem();
  if (isLoading) return <SingleProblemSkeleton />;
  if (error || !problem) return <ProblemError />;

  return (
    <div className="h-full   pb-20 px-5 pt-3">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{problem.title}</h1>
        <DifficultyBadge difficulty={problem.difficulty} />
        <ProblemTags tags={problem.tags} />
      </div>

      <div className="mt-3">
        <MarkdownView content={problem.description} />
      </div>

      {problem.hints.length > 0 && (
        <div className="mt-5 pb-10">
          <div className="font-bold flex items-center gap-2 text-muted-foreground"><span className="text-yellow-500"><FaLightbulb /></span> Hints</div>
          <Accordion type="single" collapsible>
            {problem.hints.map((hint, index) => (
              <AccordionItem key={hint.id} value={`item-${index + 1}`}>
                <AccordionTrigger className="text-muted-foreground">Hint: {index + 1}</AccordionTrigger>
                <AccordionContent className="">{hint.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}
