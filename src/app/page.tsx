"use client";

import { BorderTrail } from "@/components/ui/border-trail";
import { TextLoop } from "@/components/ui/text-loop";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

// import Editor from "@/components/editor2/Editor"

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center h-[400px]">
      <div className="relative">
        <div className="flex items-center gap-1 absolute top-2 left-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-orange-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
        </div>
        <TextLoop className="font-mono text-sm border p-10 w-[400px] rounded-xl">
          <span>We are starting soon with...</span>
          <span>Javascript DSA and Python Challenges</span>
          <span>Live Contests</span>
          <span>One:one gamified challenge</span>
        </TextLoop>
      </div>

      <div className='relative flex h-[150px] mt-5 w-[300px] flex-col items-center justify-center rounded-md bg-zinc-100 px-5 py-2 dark:bg-zinc-900'>
      <BorderTrail
        style={{
          boxShadow:
            '0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)',
        }}
        size={100}
      />
      <div
        className='flex h-full gap-3  flex-col justify-center space-y-2'
        role='status'
        aria-label='Loading...'
      >
        <div>Try out demo problems!</div>
        <div>
        <Link className="border hover:bg-zinc-200 hover:dark:bg-zinc-800 p-2 font-bold rounded-xl flex justify-center gap-2" href={"/problems"}>
        Go <ChevronRight/>
      </Link>
        </div>
      </div>
    </div>
   
    </div>
  );
}
