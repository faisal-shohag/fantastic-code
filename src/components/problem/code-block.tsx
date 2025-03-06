import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // Choose your preferred theme
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python'; // Add languages as needed

const CodeBlock = ({ code, language }) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [code]);

  return (
    <pre className="line-numbers">
      <code className={`language-${language}`}>{code}</code>
    </pre>
  );
};

export default CodeBlock;