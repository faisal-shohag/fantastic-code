import React, { FC } from 'react';
// import rangeParser from 'parse-numeric-range';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import ReactMarkdown from 'react-markdown';

interface MarkdownProps {
  markdown: string & { content?: string };
}

interface CodeProps {
  node?: {
    data?: {
      meta?: string;
    };
  };
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

// Define the type for line props function
// type LinePropsFunction = (lineNumber: number) => React.HTMLAttributes<HTMLElement>;

const Markdown: FC<MarkdownProps> = ({ markdown }) => {
    const syntaxTheme = oneDark;
  
    const MarkdownComponents: Record<string, React.FC<CodeProps>> = {
      code({ className, ...props }) {
        const hasLang = /language-(\w+)/.exec(className || '');
        // const hasMeta = node?.data?.meta;
  
        // const applyHighlights: LinePropsFunction = (lineNumber) => {
        //   if (hasMeta) {
        //     const RE = /{([\d,-]+)}/;
        //     const metadata = node?.data?.meta?.replace(/\s/g, '') || '';
        //     const strlineNumbers = RE.test(metadata)
        //       ? RE.exec(metadata)?.[1] || '0'
        //       : '0';
        //     const highlightLines = rangeParser(strlineNumbers);
        //     if (highlightLines.includes(lineNumber)) {
        //       return {
        //         'data-highlight': 'true',
        //         style: { backgroundColor: 'rgba(255, 255, 0, 0.1)' }
        //       };
        //     }
        //   }
        //   return {};
        // };
  
        const childrenContent = String(props.children).replace(/\n$/, '');
  
        return hasLang ? (
          <SyntaxHighlighter
            style={syntaxTheme}
            language={hasLang[1]}
            PreTag="div"
            className="codeStyle"
            // showLineNumbers={true}
            wrapLines={true}          // Enable line wrapping
            wrapLongLines={true}      // Wrap long lines specifically
            useInlineStyles={true}
            // lineProps={applyHighlights}
            customStyle={{
                margin: 0, 
                         // Remove default margin
              padding: '1rem',       // Add padding for better visibility
              borderRadius: '0', // Rounded corners for the code block
              overflowX: 'visible',   // Prevent horizontal scrolling
              whiteSpace: 'pre-wrap', // Ensure text wraps
              wordBreak: 'break-word' // Break long words if needed
            }}
          >
            {childrenContent}
          </SyntaxHighlighter>
        ) : (
          <code className={className} {...props} />
        );
      },
    };
  
    return <ReactMarkdown components={MarkdownComponents}>{markdown}</ReactMarkdown>;
  };

export default Markdown;