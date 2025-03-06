"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { dateFormatter, PColor } from "@/lib/others"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "react-query"
import { Copy } from "lucide-react"
import { useState } from "react"
import Markdown from "@/components/problem/mark-down-syntax"
import SubmissionSkeleton from "@/components/skeletons/submission-skeleton"
import { FaArrowLeft } from "react-icons/fa6";


const getSubmission = async (id) => {
  try {
    const res = await fetch(`/api/submission/single/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      throw new Error("Failed to fetch submission")
    }

    return res.json()
  } catch (error) {
    console.log(error)
  }
}

const Submission = () => {
  const { id } = useParams()
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const { data, isLoading, error } = useQuery({
    queryFn: () => getSubmission(id),
    queryKey: ["submission", id],
  })

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <SubmissionSkeleton/>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] text-destructive">
        Error: Something went wrong!!!
      </div>
    )
  }

  const sampleMarkdown = `
\`\`\`${data.language} {1}
${data.code}
\`\`\``;

// console.log(data)

  return (
    <div>
      <div onClick={()=>router.push(`/problems/${data.problem.unique_title}/submissions`)} className="px-3 py-1 w-full border-b border-border text-muted-foreground flex gap-1 items-center  mt-1 text-sm cursor-pointer"><FaArrowLeft /> All Submissions</div>
      <div className="p-5 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <h1 className="font-semibold text-lg" style={{ color: PColor[data.status] }}>
          {data.status}
        </h1>
        <p className="text-xs text-muted-foreground">
          {data.tc.passedTestCases}/{data.tc.totalTestCases} testcases passed ({data.percentage}%) | Runtime:{" "}
          {data.runtime} ms
        </p>
      </div>

      <div className="mt-1 flex gap-2 items-center text-muted-foreground mb-6">
        <div>
          <Avatar className="h-6 w-6">
            <AvatarImage src={data.user.image} alt={data.user.name} />
            <AvatarFallback>{data.user.name[0]}</AvatarFallback>
          </Avatar>
        </div>
        <div className="text-sm">
          <h2 className="font-medium">{data.user.name}</h2>
          <p className="text-xs">Submitted at {dateFormatter(data.date)}</p>
        </div>
      </div>

      <div className="relative rounded-lg overflow-hidden border border-border bg-card">
        <div className="flex justify-between items-center px-4 py-2 bg-muted border-b border-border">
          <span className="text-sm font-medium">Solution Code</span>
          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(data.code)} className="h-8 px-2">
            {copied ? "Copied!" : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="max-w-full overflow-x-auto">

<Markdown markdown={sampleMarkdown} />
        </div>
      </div>
    </div>
    </div>
  )
}

export default Submission