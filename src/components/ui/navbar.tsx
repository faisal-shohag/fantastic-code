"use client"
import Link from "next/link";
import Logo from "./logo";
import { ModeToggle } from "./mode-toggle";
import { usePathname } from "next/navigation";

const NavBar = () => {
    const path = usePathname()
    if(path.includes('problems/')) return null
    return (
        <div className="p-2 flex rounded-xl mb-1 custom-glass justify-between items-center">
          <Link href="/" className="flex items-center">
            <Logo color="#ffff" width="30px" height="30px" />
            <div className="flex flex-col">
                <span className="text-sm font-gg-semi uppercase">Fantastic</span>
                <span className="text-xs -mt-[5px]">code</span>
            </div>
            </Link>
          <div></div>
          <div><ModeToggle/></div>
        </div>
    );
};

export default NavBar;