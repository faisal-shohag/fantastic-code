import { Code2Icon } from "lucide-react";
import { IoPlay } from "react-icons/io5";
import { TbCloudUpload } from "react-icons/tb";

import Timer from "./Timer";

const SolutionHead = ({onRun, onSubmit}) => {
    return (
      <div className="p-2 bg-zinc-800 flex justify-between items-center px-3 text-zinc-400">
        
        <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Code2Icon className="text-green-500" />
          <span className=" font-gg-med">Solution</span>
        </div>

        <div className="">
        <Timer/>
        </div>
        </div>

        <div onClick={onRun} className="flex items-center gap-2">
          <div className="flex items-center gap-1 dark:bg-zinc-950 px-3 py-1 rounded-md cursor-pointer hover:bg-zinc-800 hover:dark:bg-zinc-900">
            <IoPlay className="text-green-500" />
            <span className="text-sm">Run</span>
          </div>
  
          <div onClick={onSubmit} className="flex items-center gap-1 dark:bg-zinc-950 px-3 py-1 rounded-md cursor-pointer hover:bg-zinc-800 hover:dark:bg-zinc-900">
            <TbCloudUpload className="text-green-500" />{" "}
            <span className="text-sm">Submit</span>
          </div>
        </div>
      </div>
    );
  };

  export default SolutionHead