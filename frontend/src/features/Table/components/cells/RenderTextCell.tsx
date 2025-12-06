import { JSX } from "react";

interface RenderTextCellProps {
    text: string | null | undefined;
    className?: string;
}

export default function RenderTextCell({ text, className = "" }: RenderTextCellProps): JSX.Element {
    if (!text || text === '') {
        return <span className="text-sm text-gray-400 italic">-</span>;
    }

    return <span className={`text-sm text-gray-900 ${className}`}>{text}</span>;
}

