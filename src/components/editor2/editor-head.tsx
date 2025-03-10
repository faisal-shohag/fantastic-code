import React, { useState } from "react";
import {
  CustomSelect,
  CustomSelectContent,
  CustomSelectGroup,
  CustomSelectItem,
  CustomSelectTrigger,
  CustomSelectValue,
} from "@/components/ui/custom-select";
import { BiLogoJavascript } from "react-icons/bi";
import { CgFormatLeft } from "react-icons/cg";
import { GoBookmarkFill } from "react-icons/go";
import { GrRotateLeft } from "react-icons/gr";
import { LuMaximize2 } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import EditorSettings from "./editor-settings";

export default function EditorHeader({ language, setLanguageHandler }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const setLanguage = (value) => {
    localStorage.setItem("language", value);
    setLanguageHandler(value);
  };

  return (
    <div className="flex justify-between items-center w-full text-zinc-400 pr-1">
      <div className="flex items-center gap-2">
        <CustomSelect
          onValueChange={(value) => setLanguage(value)}
          defaultValue={
            localStorage.getItem("language")
              ? localStorage.getItem("language")
              : language
          }
        >
          <CustomSelectTrigger className="w-[115px]">
            <CustomSelectValue placeholder="Select language" />
          </CustomSelectTrigger>
          <CustomSelectContent>
            <CustomSelectGroup>
              {/* <CustomSelectItem value="python">
                <span className="flex items-center gap-1 text-xs">
                  <BiLogoPython size={18} className="text-[#2b5b84]" /> Python
                </span>
              </CustomSelectItem> */}
              <CustomSelectItem value="javascript">
                <span className="flex items-center gap-1 text-xs">
                  <BiLogoJavascript className="text-yellow-500" /> JavaScript
                </span>
              </CustomSelectItem>
            </CustomSelectGroup>
          </CustomSelectContent>
        </CustomSelect>
      </div>

      <div className="flex items-center gap-1">
        <div className="hover:bg-zinc-800 px-1 py-[2px] rounded cursor-pointer">
          <CgFormatLeft />
        </div>
        <div className="hover:bg-zinc-800 px-1 py-[2px] rounded cursor-pointer">
          <GoBookmarkFill />
        </div>
        <div className="hover:bg-zinc-800 px-1 py-[2px] rounded cursor-pointer">
          <GrRotateLeft />
        </div>
        <div className="hover:bg-zinc-800 px-1 py-[2px] rounded cursor-pointer">
          <LuMaximize2 size={14} />
        </div>
        <div 
          className="hover:bg-zinc-800 px-1 py-[2px] rounded cursor-pointer"
          onClick={() => setIsSettingsOpen(true)}
        >
          <IoSettingsOutline size={14} />
        </div>
      </div>

      {/* Editor Settings Modal */}
      <EditorSettings 
        open={isSettingsOpen} 
        onOpenChange={setIsSettingsOpen} 
      />
    </div>
  );
}