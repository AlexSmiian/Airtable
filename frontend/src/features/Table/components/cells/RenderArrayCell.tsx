import {JSX} from "react";

interface RenderArrayCellProps {
    items: string[] | null | undefined;
    variant?: 'tags' | 'attributes';
    maxVisible?: number;
}

export function RenderArrayCell({
                                    items,
                                    variant = 'tags',
                                    maxVisible = 3
                                }: RenderArrayCellProps): JSX.Element {
    if (!items || !Array.isArray(items) || items.length === 0) {
        return <span className="text-sm text-gray-400 italic">-</span>;
    }


    const getColorClasses = () => {
        switch (variant) {
            case 'tags':
                return 'bg-indigo-100 text-indigo-800';
            case 'attributes':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const visibleItems = items.slice(0, maxVisible);
    const remainingCount = items.length - maxVisible;

    return (
        <div className="flex flex-wrap gap-1">
            {visibleItems.map((item, i) => (
                <span key={i} className={`px-2 py-1 rounded text-xs font-medium ${getColorClasses()}`}>
                    {item}
                </span>
            ))}
            {remainingCount > 0 && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                    +{remainingCount}
                </span>
            )}
        </div>
    );
}