"use client"

import Link from "next/link"

// import Editor from "@/components/editor2/Editor"

export default function Home() {


  return (
    <div className="flex flex-col justify-center items-center">
      <div className="text-3xl">This site is under construction!</div>
     <Link className="underline" href={'/problems'}>Go to Problems</Link>
    </div>
  )
}