"use client"

import Editor, {useMonaco, loader} from '@monaco-editor/react'
import {
    CustomSelect,
    CustomSelectContent,
    CustomSelectGroup,
    CustomSelectItem,
    CustomSelectLabel,
    CustomSelectTrigger,
    CustomSelectValue,
  } from "@/components/ui/custom-select"

  import { BiLogoJavascript } from "react-icons/bi";
  import { BiLogoTypescript } from "react-icons/bi";
  import { MdAutoMode } from "react-icons/md";
  import { CgFormatLeft } from "react-icons/cg";
  import { GoBookmarkFill } from "react-icons/go";

import { GrRotateLeft } from "react-icons/gr";
import { LuMaximize2 } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";

const CodeEditor = ({onChange}) => {
    const options = {
        acceptSuggestionOnCommitCharacter: true,
        acceptSuggestionOnEnter: 'on',
        accessibilitySupport: 'auto',
        autoIndent: false,
        automaticLayout: true,
        codeLens: true,
        colorDecorators: true,
        contextmenu: true,
        cursorBlinking: 'phase',
        cursorSmoothCaretAnimation: true,
        cursorStyle: 'line',
        disableLayerHinting: false,
        disableMonospaceOptimizations: false,
        dragAndDrop: false,
        fixedOverflowWidgets: false,
        folding: true,
        foldingStrategy: 'auto',
        fontLigatures: false,
        formatOnPaste: false,
        formatOnType: false,
        hideCursorInOverviewRuler: false,
        highlightActiveIndentGuide: true,
        links: true,
        mouseWheelZoom: false,
        multiCursorMergeOverlapping: true,
        multiCursorModifier: 'alt',
        overviewRulerBorder: true,
        overviewRulerLanes: 2,
        quickSuggestions: true,
        quickSuggestionsDelay: 100,
        readOnly: false,
        renderControlCharacters: false,
        renderFinalNewline: true,
        renderIndentGuides: true,
        renderLineHighlight: 'all',
        renderWhitespace: 'none',
        revealHorizontalRightPadding: 30,
        roundedSelection: true,
        rulers: [],
        scrollBeyondLastColumn: 5,
        scrollBeyondLastLine: true,
        selectOnLineNumbers: true,
        selectionClipboard: true,
        selectionHighlight: true,
        showFoldingControls: 'mouseover',
        smoothScrolling: false,
        suggestOnTriggerCharacters: true,
        wordBasedSuggestions: true,
        // eslint-disable-next-line
        wordSeparators: `~!@#$%^&*()-=+[{]}\|;:'",.<>/?`,
        wordWrap: 'off',
        wordWrapBreakAfterCharacters: '\t})]?|&,;',
        wordWrapBreakBeforeCharacters: '{([+',
        wordWrapBreakObtrusiveCharacters: '.',
        wordWrapColumn: 80,
        wordWrapMinified: true,
        wrappingIndent: 'none',
}
      

    

    return (
        <div>
        <div className='flex justify-between items-center w-full text-zinc-400 pr-1'>
         <div className='flex items-center gap-2'>
         <CustomSelect defaultValue='javascript'>
      <CustomSelectTrigger className="w-[115px]">
        <CustomSelectValue placeholder="Select language" />
      </CustomSelectTrigger>
      <CustomSelectContent>
        <CustomSelectGroup>
          <CustomSelectLabel></CustomSelectLabel>
          <CustomSelectItem  value="javascript"><span className='flex items-center gap-1 text-xs'><BiLogoJavascript className='text-yellow-500'/> JavaScript</span></CustomSelectItem>
          <CustomSelectItem value="typescript"> 
          <span className='flex items-center gap-1 text-xs'><BiLogoTypescript className='text-blue-500'/> TypeScript</span></CustomSelectItem>       
        </CustomSelectGroup>
      </CustomSelectContent>
    </CustomSelect>
         <div className='flex hover:bg-zinc-800 px-2 py-[2px] darkbg items-center text-xs gap-1 cursor-pointer rounded-sm'><MdAutoMode/> <span>Auto</span></div>
         </div>

         <div className='flex items-center gap-1'>
            <div className='hover:bg-zinc-800 px-1 py-[2px] rounded cursor-pointer'><CgFormatLeft /></div>
            <div className='hover:bg-zinc-800 px-1 py-[2px] rounded cursor-pointer'><GoBookmarkFill /></div>
            <div className='hover:bg-zinc-800 px-1 py-[2px] rounded cursor-pointer'><GrRotateLeft /></div>
          
            <div className='hover:bg-zinc-800 px-1 py-[2px] rounded cursor-pointer'><LuMaximize2 size={14} /></div>
            <div className='hover:bg-zinc-800 px-1 py-[2px] rounded cursor-pointer'><IoSettingsOutline size={14} /></div>
         </div>




        </div>
            <Editor 
            onChange={onChange}
            theme='vs-dark'
            className=''
            options={options}
            height={'80vh'} 
            defaultValue={`console.log('Hello World')`} defaultLanguage='javascript'/>
        </div>
    );
};

export default CodeEditor;