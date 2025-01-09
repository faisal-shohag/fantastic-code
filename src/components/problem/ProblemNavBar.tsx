"use client"
import Link from "next/link";
import { MdOutlineDescription } from "react-icons/md";
import { IoBookOutline, IoFlask } from "react-icons/io5";
import { LuHistory } from "react-icons/lu";
import { usePathname } from "next/navigation";

const ProblemNavBar = ({problemName}) => {
    const path = usePathname()

    
    const pathNames = {
        '/': `/${path.split('/')[1]}/${problemName}`,
        'editorial': `/problems/${problemName}/editorial`,
        'solutions': `/problems/${problemName}/solutions`,
        'submissions': `/problems/${problemName}/submissions`,
    }

    return (
        <div className="dark:bg-zinc-800 bg-slate-300 px-2 py-1 flex items-center gap-3 text-sm font-gg-med">
            <Link className={`flex gap-1 items-center hover:bg-slate-400 hover:dark:bg-zinc-700  px-2 py-1 rounded-md hover:shadow-xl  ${pathNames['/'] === path && 'bg-zinc-700 font-gg-semi'}`} href={pathNames['/']}>
            <MdOutlineDescription className="text-blue-500"/> Description
            </Link>

        <span className="text-zinc-700">|</span>

            <Link className={`flex gap-1 items-center hover:bg-slate-400 hover:dark:bg-zinc-700 px-2 py-1 rounded-md hover:shadow-xl ${pathNames['editorial'] === path && 'bg-zinc-700 font-gg-semi'}`} href={pathNames['editorial']}>
            <IoBookOutline className="text-green-500"/> Editorial
            </Link>

            <span className="text-zinc-700">|</span>


            <Link className={`flex gap-1 items-center hover:bg-slate-400 hover:dark:bg-zinc-700 px-2 py-1 rounded-md hover:shadow-xl ${pathNames['solutions'] === path && 'bg-zinc-700 font-gg-semi'}`} href={pathNames['solutions']}>
            <IoFlask className="text-purple-500"/> Solutions
            </Link>
            
            <span className="text-zinc-700">|</span>

            <Link className={`flex gap-1 items-center hover:bg-slate-400 hover:dark:bg-zinc-700 px-2 py-1 rounded-md hover:shadow-xl ${pathNames['submissions'] === path && 'bg-zinc-700 font-gg-semi'}`} href={pathNames['submissions']}>
            <LuHistory className="text-yellow-500"/> Submissions
            </Link>
        </div>
    );
};

export default ProblemNavBar;