import { Code2Icon, LoaderIcon } from "lucide-react";
import { IoPlay } from "react-icons/io5";
import { TbCloudUpload } from "react-icons/tb";

import Timer from "./Timer";

const SolutionHead = ({onRun, onSubmit, isRunning, isSubmitting}) => {
    return (
      <div className="p-2 dark:bg-zinc-800 bg-slate-300 flex justify-between items-center px-3 ">
        
        <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Code2Icon className="text-green-500" />
          <span className=" font-gg-med">Solution</span>
        </div>

        <div className="">
        <Timer/>
        </div>
        </div>

        <div className="flex items-center gap-2">
          <div onClick={()=>onRun()}  className="flex items-center gap-1 dark:bg-zinc-950 px-3 py-1 rounded-md cursor-pointer hover:bg-zinc-100 hover:dark:bg-zinc-900">
           {isRunning ?<LoaderIcon className="animate-spin"/> : <IoPlay className="text-green-500" />}
            <span className="text-sm">Run</span>
          </div>
  
          <div onClick={()=>onSubmit()} className="flex items-center gap-1 dark:bg-zinc-950 px-3 py-1 rounded-md cursor-pointer hover:bg-zinc-100 hover:dark:bg-zinc-900">
            {isSubmitting ?<LoaderIcon className="animate-spin"/> : <TbCloudUpload className="text-green-500" />}
            <span className="text-sm">Submit</span>
          </div>
        </div>
      </div>
    );
  };

  export default SolutionHead