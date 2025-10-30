import React from 'react';
import * as ReactKatex from 'react-katex';

interface MathRendererProps {
    text: string;
}

// Regex to find all occurrences of $...$ or $$...$$
const mathRegex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;

export const MathRenderer: React.FC<MathRendererProps> = ({ text }) => {
    if (!text) return null;

    const parts = text.split(mathRegex);

    return (
        <>
            {parts.map((part, index) => {
                if (part.startsWith('$$') && part.endsWith('$$')) {
                    return <ReactKatex.BlockMath key={index}>{part.slice(2, -2)}</ReactKatex.BlockMath>;
                } else if (part.startsWith('$') && part.endsWith('$')) {
                    return <ReactKatex.InlineMath key={index}>{part.slice(1, -1)}</ReactKatex.InlineMath>;
                } else {
                    return <span key={index}>{part}</span>;
                }
            })}
        </>
    );
};
