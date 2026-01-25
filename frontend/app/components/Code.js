"use client";

import { useState, useMemo } from "react";
import styles from "./Code.module.css";
import { useProject } from "@/app/context/ProjectContext";

const languageLabels = {
    javascript: "JavaScript",
    python: "Python",
    json: "JSON",
    typescript: "TypeScript",
    html: "HTML",
    css: "CSS",
    cpp: "C++",
    arduino: "Arduino",
    c: "C"
};

// Detect language from code content
function detectLanguage(code) {
    if (!code) return "cpp";
    
    const codeLower = code.toLowerCase();
    
    // Arduino/C++ indicators
    if (codeLower.includes("void setup") || codeLower.includes("void loop") || 
        codeLower.includes("arduino.h") || codeLower.includes("#include <arduino")) {
        return "cpp";
    }
    
    // Python indicators
    if (codeLower.includes("def ") || codeLower.includes("import ") || 
        codeLower.includes("print(") || codeLower.includes("if __name__")) {
        return "python";
    }
    
    // JavaScript/TypeScript indicators
    if (codeLower.includes("function ") || codeLower.includes("const ") || 
        codeLower.includes("let ") || codeLower.includes("export ")) {
        return "javascript";
    }
    
    // Default to C++ for embedded code
    return "cpp";
}

export default function Code() {
    const { projectData } = useProject();
    const [copied, setCopied] = useState(false);
    
    // Get firmware code from projectData
    const firmwareCode = projectData?.parts?.firmware || projectData?.firmware || null;
    
    // Detect language from code
    const language = useMemo(() => {
        if (firmwareCode) {
            return detectLanguage(firmwareCode);
        }
        return "cpp";
    }, [firmwareCode]);

    const handleCopy = async () => {
        if (!firmwareCode) return;
        
        try {
            await navigator.clipboard.writeText(firmwareCode);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (!firmwareCode) {
        return (
            <div className={styles.codeContainer}>
                <div className="nes-container is-dark is-rounded">
                    <div style={{ textAlign: "center", padding: "2rem" }}>
                        <i className="nes-icon is-large code"></i>
                        <p style={{ marginTop: "1rem", color: "#888" }}>GENERATING CODE...</p>
                        <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.5rem" }}>
                            (Code will appear here when ready)
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.codeContainer}>
            <CodeBlock
                code={firmwareCode}
                language={language}
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
        
    } else if (language === 'cpp' || language === 'arduino' || language === 'c') {
        // C++/Arduino/C syntax highlighting
        
        // Block comments
        highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>');
        
        // Line comments
        highlighted = highlighted.replace(/\/\/.*$/gm, '<span class="comment">$&</span>');
        
        // Strings (double quotes)
        highlighted = highlighted.replace(/"([^"\\]|\\.)*"/g, '<span class="string">$&</span>');
        
        // Strings (single quotes for chars)
        highlighted = highlighted.replace(/'([^'\\]|\\.)*'/g, '<span class="string">$&</span>');
        
        // Preprocessor directives
        highlighted = highlighted.replace(/^#\s*\w+/gm, '<span class="preprocessor">$&</span>');
        
        // Keywords
        const keywords = ['void', 'int', 'float', 'double', 'char', 'bool', 'byte', 'word', 'long', 'unsigned', 'signed',
                         'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return',
                         'class', 'struct', 'enum', 'typedef', 'const', 'static', 'extern', 'volatile',
                         'public', 'private', 'protected', 'virtual', 'override', 'final',
                         'include', 'define', 'ifdef', 'ifndef', 'endif', 'pragma',
                         'setup', 'loop', 'digitalWrite', 'digitalRead', 'analogWrite', 'analogRead',
                         'pinMode', 'Serial', 'delay', 'millis', 'micros'];
        
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
        highlighted = highlighted.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, (match, funcName) => {
            if (keywordSet.has(funcName)) return match;
            if (match.includes('<span')) return match; // Already highlighted
            return `<span class="function">${funcName}</span> `;
        });
        
        // Numbers
        highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, (match, offset) => {
            const before = highlighted.substring(0, offset);
            const lastSpan = before.lastIndexOf('<span');
            const lastClose = before.lastIndexOf('</span>');
            if (lastSpan > lastClose) return match; // Inside a span
            return `<span class="number">${match}</span>`;
        });
    }
    
    return highlighted;
}
