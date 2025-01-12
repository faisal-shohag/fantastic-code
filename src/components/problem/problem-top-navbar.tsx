import { ModeToggle } from "../ui/mode-toggle";

export default function ProblemTopNavBar() {
    return (
        <div className="px-2 py-1 bg-zinc-100 shadow-xl flex justify-between items-center dark:bg-zinc-900 mb-2">
        <div></div>
        <div><ModeToggle/></div>
        </div>
    )
}