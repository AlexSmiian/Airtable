import {JSX} from "react";

interface RenderDateCellProps {
    date: string | Date | null | undefined;
    format?: 'date' | 'datetime' | 'time';
}

export function RenderDateCell({ date, format = 'date' }: RenderDateCellProps): JSX.Element {
    if (!date) {
        return <span className="text-sm text-gray-400 italic">-</span>;
    }

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
        return <span className="text-sm text-gray-400 italic">Invalid date</span>;
    }

    let formatted: string;

    switch (format) {
        case 'datetime':
            formatted = dateObj.toLocaleString('uk-UA', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            break;
        case 'time':
            formatted = dateObj.toLocaleTimeString('uk-UA', {
                hour: '2-digit',
                minute: '2-digit'
            });
            break;
        case 'date':
        default:
            formatted = dateObj.toLocaleDateString('uk-UA');
            break;
    }

    return <span className="text-sm text-gray-600">{formatted}</span>;
}