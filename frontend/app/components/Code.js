"use client";

import { useState } from "react";
import styles from "./Code.module.css";

// Single code snippet
const codeSnippet = {
    language: "javascript",
    code: `// Main application logic
function handleSubmit(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const userInput = formData.get('input');
  
  // Process input
  if (userInput && userInput.length > 0) {
    processData(userInput)
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }
}

// Data processing function
async function processData(input) {
  const response = await fetch('/api/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input })
  });
  return response.json();
}`
};

const languageLabels = {
    javascript: "JavaScript",
    python: "Python",
    json: "JSON",
    typescript: "TypeScript",
    html: "HTML",
    css: "CSS"
};

export default function Code() {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(codeSnippet.code);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className={styles.codeContainer}>
            <CodeBlock
                code={codeSnippet.code}
                language={codeSnippet.language}
                onCopy={handleCopy}
                copied={copied}
            />
        </div>
    );
}

// Code Block Component
function CodeBlock({ code, language, onCopy, copied }) {
    const highlightedCode = highlightCode(code, language);

    return (
        <div className={styles.codeBlockWrapper}>
            {/* Header Bar */}
            <div className={styles.codeHeader}>
                <span className={styles.languageLabel}>
                    {languageLabels[language] || language.toUpperCase()}
                </span>
                <button
                    type="button"
                    className={`nes-btn is-small ${styles.copyButton} ${copied ? styles.copied : ''}`}
                    onClick={onCopy}
                >
                    {copied ? "Copied!" : "Copy"}
                </button>
            </div>

            {/* Code Content */}
            <div className={styles.codeContent}>
                <pre className={styles.codePre}>
                    <code 
                        className={`${styles.code} language-${language}`}
                        dangerouslySetInnerHTML={{ __html: highlightedCode }}
                    />
                </pre>
            </div>
        </div>
    );
}

// Enhanced syntax highlighting function
function highlightCode(code, language) {
    if (!code) return '';
    
    // Escape HTML first
    let highlighted = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    if (language === 'javascript' || language === 'typescript') {
        // Process in order: comments -> strings -> keywords -> functions -> numbers
        
        // Block comments
        highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>');
        
        // Line comments
        highlighted = highlighted.replace(/\/\/.*$/gm, '<span class="comment">$&</span>');
        
        // Template literals (backticks)
        highlighted = highlighted.replace(/`[^`]*`/g, '<span class="string">$&</span>');
        
        // Double-quoted strings
        highlighted = highlighted.replace(/"([^"\\]|\\.)*"/g, '<span class="string">$&</span>');
        
        // Single-quoted strings
        highlighted = highlighted.replace(/'([^'\\]|\\.)*'/g, '<span class="string">$&</span>');
        
        // Keywords - simple approach, process after strings
        const keywords = ['const', 'let', 'var', 'function', 'async', 'await', 'if', 'else', 'for', 'while', 'return', 'try', 'catch', 'finally', 'import', 'export', 'from', 'default', 'class', 'extends', 'new', 'this', 'true', 'false', 'null', 'undefined', 'typeof', 'instanceof', 'break', 'continue', 'switch', 'case', 'do'];
        keywords.forEach(keyword => {
            highlighted = highlighted.replace(new RegExp(`\\b${keyword}\\b`, 'g'), (match, offset) => {
                const before = highlighted.substring(0, offset);
                const lastSpan = before.lastIndexOf('<span');
                const lastClose = before.lastIndexOf('</span>');
                if (lastSpan > lastClose) return match; // Inside a span
                return `<span class="keyword">${match}</span>`;
            });
        });
        
        // Function names (before parentheses, but not keywords)
        const keywordSet = new Set(keywords);
        highlighted = highlighted.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, (match, funcName) => {
            if (keywordSet.has(funcName)) return match;
            if (match.includes('<span')) return match; // Already highlighted
            return `<span class="function">${funcName}</span> `;
        });
        
        // Numbers - simple approach
        highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, (match, offset) => {
            const before = highlighted.substring(0, offset);
            const lastSpan = before.lastIndexOf('<span');
            const lastClose = before.lastIndexOf('</span>');
            if (lastSpan > lastClose) return match; // Inside a span
            return `<span class="number">${match}</span>`;
        });
        
    } else if (language === 'python') {
        // Comments first
        highlighted = highlighted.replace(/#.*$/gm, '<span class="comment">$&</span>');
        
        // Triple-quoted strings
        highlighted = highlighted.replace(/"""[\s\S]*?"""/g, '<span class="string">$&</span>');
        highlighted = highlighted.replace(/'''[\s\S]*?'''/g, '<span class="string">$&</span>');
        
        // Regular strings
        highlighted = highlighted.replace(/"([^"\\]|\\.)*"/g, '<span class="string">$&</span>');
        highlighted = highlighted.replace(/'([^'\\]|\\.)*'/g, '<span class="string">$&</span>');
        
        // Keywords
        const keywords = ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'return', 'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'pass', 'break', 'continue', 'lambda', 'yield', 'global', 'nonlocal'];
        keywords.forEach(keyword => {
            highlighted = highlighted.replace(new RegExp(`\\b${keyword}\\b`, 'g'), (match, offset) => {
                const before = highlighted.substring(0, offset);
                const lastSpan = before.lastIndexOf('<span');
                const lastClose = before.lastIndexOf('</span>');
                if (lastSpan > lastClose) return match; // Inside a span
                return `<span class="keyword">${match}</span>`;
            });
        });
        
        // Function names after 'def'
        highlighted = highlighted.replace(/\bdef\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="keyword">def</span> <span class="function">$1</span>(');
        
        // Numbers
        highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, (match, offset) => {
            const before = highlighted.substring(0, offset);
            const lastSpan = before.lastIndexOf('<span');
            const lastClose = before.lastIndexOf('</span>');
            if (lastSpan > lastClose) return match; // Inside a span
            return `<span class="number">${match}</span>`;
        });
        
    } else if (language === 'json') {
        // JSON keys
        highlighted = highlighted.replace(/"([^"]+)":/g, '<span class="key">"$1"</span>:');
        
        // JSON string values
        highlighted = highlighted.replace(/:\s*"([^"]*)"/g, ': <span class="string">"$1"</span>');
        
        // JSON numbers
        highlighted = highlighted.replace(/:\s*(\d+\.?\d*)/g, ': <span class="number">$1</span>');
        
        // JSON booleans and null
        highlighted = highlighted.replace(/:\s*(true|false|null)\b/g, ': <span class="boolean">$1</span>');
    }
    
    return highlighted;
}
