"use client";
import Link from "next/link";
import Logo from "./logo";
import { ModeToggle } from "./mode-toggle";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "./avatar";
import { AvatarImage } from "@radix-ui/react-avatar";

const NavBar = () => {
  const session = useSession();
  const user = session.data?.user;

  const path = usePathname();
  if (path.includes("problems/")) return null;

  return (
    <div className="p-2  rounded-xl  mb-1 custom-glass ">
      <div className="mx-auto container flex justify-between items-center">
      <Link href="/" className="flex items-center">
        <Logo color="#ffff" width="30px" height="30px" />
        <div className="flex flex-col">
          <span className="text-sm font-gg-semi uppercase">Fantastic</span>
          <span className="text-xs -mt-[5px]">code</span>
        </div>
      </Link>
      <div></div>
      <div className="flex items-center gap-2">
        <ModeToggle />
        {
        user && <div>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ''}></AvatarImage>
            <AvatarFallback>{user.name && user.name[0]}</AvatarFallback>
          </Avatar>
        </div>
      }
      </div>

      </div>

     
    </div>
  );
};

export default NavBar;
