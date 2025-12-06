import {JSX} from "react";

interface RenderNumberCellProps {
    value: number | string | null | undefined;
    format?: 'currency' | 'decimal' | 'integer';
    currency?: string;
    decimals?: number;
}

export function RenderNumberCell({
                                     value,
                                     format = 'integer',
                                     currency = 'USD',
                                     decimals = 2
                                 }: RenderNumberCellProps): JSX.Element {
    if (value === null || value === undefined) {
        return <span className="text-sm text-gray-400 italic">-</span>;
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
        return <span className="text-sm text-gray-400 italic">-</span>;
    }

    let formatted: string;

    switch (format) {
        case 'currency':
            formatted = numValue.toLocaleString('uk-UA', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
            break;
        case 'decimal':
            formatted = numValue.toLocaleString('uk-UA', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
            break;
        case 'integer':
        default:
            formatted = Math.round(numValue).toLocaleString('uk-UA');
            break;
    }

    return (
        <div className="text-right text-sm font-medium text-gray-900">
            {formatted}
        </div>
    );
}