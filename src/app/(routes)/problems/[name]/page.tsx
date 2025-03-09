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
import { CheckCircle, CircleMinus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";


export default function ProblemPage() {
  const { problem, isLoading, error } = useProblem();
  if (isLoading) return <SingleProblemSkeleton />;
  if (error || !problem) return <ProblemError />;
  console.log(problem)
  return (
    <div className="h-full pb-20 px-5 pt-3 ">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{problem.title}</h1>
        <div className="flex items-center gap-1">
          <h1 className="text-xs text-muted-foreground">Contributed by: </h1>
          <Avatar className="h-5 w-5">
            <AvatarImage src={problem.author.image} />
            <AvatarFallback className="text-xs">{problem.author.name[0]}</AvatarFallback>
          </Avatar>

          <h3 className="text-xs">{problem.author.name}</h3>
        </div>
        <div className="flex gap-3 items-center">
        <span>    <DifficultyBadge difficulty={problem.difficulty} /> </span>
        {problem.status == "solved" && (
                            <div className="flex items-center">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                          )}

{problem.status == "attempted" && (
                            <div className="flex items-center">
                              <CircleMinus className="w-5 h-5 text-yellow-500" />
                            </div>
                          )}

                         
        </div>
    
        <ProblemTags tags={problem.tags} />
      </div>

      <div className="mt-3">
        <MarkdownView content={problem.description} />
      </div>

      {(problem.hints.length > 0 && problem.hints[0].content !== '' ) && (
        <div className="mt-5 pb-10">
          <div className="font-bold flex items-center gap-1 text-muted-foreground"><span className="text-yellow-500"><FaLightbulb /></span> 
          <div>
            <div>Hints</div>
          </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Please try to solve the problem before looking at the hints. Hints should be used as a last resort.
          </div>
          <Accordion type="single" collapsible>
            {problem.hints.map((hint, index) => (
              <AccordionItem key={hint.id} value={`item-${index + 1}`}>
                <AccordionTrigger className="text-muted-foreground">Hint: {index + 1}</AccordionTrigger>
                <AccordionContent className="">
                  <MarkdownView content={hint.content} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}
