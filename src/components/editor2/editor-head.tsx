import {
    CustomSelect,
    CustomSelectContent,
    CustomSelectGroup,
    CustomSelectItem,
    CustomSelectTrigger,
    CustomSelectValue,
  } from "@/components/ui/custom-select";
  import { BiLogoJavascript, BiLogoPython, BiLogoTypescript } from "react-icons/bi";
//   import { MdAutoMode } from "react-icons/md";
  import { CgFormatLeft } from "react-icons/cg";
  import { GoBookmarkFill } from "react-icons/go";
  import { GrRotateLeft } from "react-icons/gr";
  import { LuMaximize2 } from "react-icons/lu";
  import { IoSettingsOutline } from "react-icons/io5";

export default function EditorHeader({language, setLanguageHandler}) {
  const setLanguage = (value) => {
    localStorage.setItem('language', value)
    setLanguageHandler(value)
  }

  return (
    <div className="flex justify-between items-center w-full text-zinc-400 pr-1">
    <div className="flex items-center gap-2">
      <CustomSelect onValueChange={(value) => setLanguage(value)} defaultValue={localStorage.getItem('language') ? localStorage.getItem('language') : language}>
        <CustomSelectTrigger className="w-[115px]">
          <CustomSelectValue  placeholder="Select language" />
        </CustomSelectTrigger>
        <CustomSelectContent>
          <CustomSelectGroup>
            <CustomSelectItem value="python">
              <span className="flex items-center gap-1 text-xs">
                <BiLogoPython size={18} className="text-[#2b5b84]" />{" "}
                Python
              </span>
            </CustomSelectItem>
            <CustomSelectItem value="javascript">
                          <span className='flex items-center gap-1 text-xs'>
                              <BiLogoJavascript className='text-yellow-500' /> JavaScript
                          </span>
                      </CustomSelectItem>
            <CustomSelectItem value="typescript">
                          <span className='flex items-center gap-1 text-xs'>
                              <BiLogoTypescript className='text-blue-500' /> TypeScript
                          </span>
                      </CustomSelectItem>
          </CustomSelectGroup>
        </CustomSelectContent>
      </CustomSelect>
      {/* <div onClick={handleAutoCompletion} className={`${autoCompletion !== "off" &&  'bg-green-500 text-white'} flex hover:bg-zinc-800 px-2 py-[2px] items-center text-xs gap-1 cursor-pointer rounded-sm`}>
        <MdAutoMode /> <span>Auto</span>
      </div> */}
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
      <div className="hover:bg-zinc-800 px-1 py-[2px] rounded cursor-pointer">
        <IoSettingsOutline size={14} />
      </div>
    </div>
  </div>
  )
}