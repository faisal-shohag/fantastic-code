import { Copy } from "lucide-react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useState } from "react";

const SubmissionSkeleton = () => {
    const [copied] = useState(false); // Keep this for the button state, though it won't change in skeleton
  
    return (
      <div className="p-5 max-w-full">
        {/* Status and Test Cases Section */}
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-24" /> {/* Status */}
          <Skeleton className="h-4 w-48" /> {/* Test cases and runtime */}
        </div>
  
        {/* User Info Section */}
        <div className="mt-1 flex gap-2 items-center mb-6">
          <div>
            <Avatar className="h-6 w-6">
              <AvatarFallback>
                <Skeleton className="h-6 w-6 rounded-full" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-sm space-y-1">
            <Skeleton className="h-4 w-32" /> {/* User name */}
            <Skeleton className="h-3 w-24" /> {/* Submitted date */}
          </div>
        </div>
  
        {/* Code Section */}
        <div className="relative rounded-lg overflow-hidden border border-border bg-card">
          <div className="flex justify-between items-center px-4 py-2 bg-muted border-b border-border">
            <Skeleton className="h-4 w-24" /> {/* "Solution Code" text */}
            <Button variant="ghost" size="sm" disabled className="h-8 px-2">
              {copied ? "Copied!" : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="max-w-full p-4">
            {/* Simulate code block with multiple lines */}
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-4 w-4/6 mb-2" />
            <Skeleton className="h-4 w-3/6" />
          </div>
        </div>
      </div>
    );
  };

  export default SubmissionSkeleton;