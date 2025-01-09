"use client"

import MarkdownPreview from "@uiw/react-markdown-preview";
import rehypeSanitize from "rehype-sanitize";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useTheme } from "next-themes";

const MarkdownView = ({content, className=""}) => {
    const { theme } = useTheme();
    const markdownTheme = theme === "dark" ? "dark" : "light";
    return (
        <MarkdownPreview
        className={className}
                    wrapperElement={{
                      "data-color-mode": markdownTheme,
                    }}
                    
                    source={content}
                    rehypePlugins={[rehypeSanitize, rehypeKatex]}
                    remarkPlugins={[remarkMath]}
                  />
    );
};

export default MarkdownView;