import {JSX} from "react";

interface RenderSelectCellProps {
    value: string | string[] | null | undefined;
    variant?: 'default' | 'status' | 'category' | 'priority';
    isMultiple?: boolean;
}

export function RenderSelectCell({
                                     value,
                                     variant = 'default',
                                     isMultiple = false
                                 }: RenderSelectCellProps): JSX.Element {

    if (isMultiple && Array.isArray(value)) {
        if (value.length === 0) {
            return <span className="text-sm text-gray-400 italic">-</span>;
        }

        const getColorClasses = (item: string) => {
            if (variant === 'category') {
                return 'bg-purple-100 text-purple-800';
            }
            return 'bg-gray-100 text-gray-800';
        };

        return (
            <div className="flex flex-wrap gap-1">
                {value.map((item, i) => (
                    <span key={i} className={`px-2 py-1 rounded-full text-xs font-medium ${getColorClasses(item)}`}>
                        {item}
                    </span>
                ))}
            </div>
        );
    }

    const singleValue = Array.isArray(value) ? value[0] : value;

    if (!singleValue) {
        return <span className="text-sm text-gray-400 italic">-</span>;
    }

    const getColorClasses = () => {
        if (variant === 'status') {
            switch (singleValue) {
                case 'Active':
                    return 'bg-green-100 text-green-800';
                case 'Pending':
                    return 'bg-yellow-100 text-yellow-800';
                case 'Completed':
                    return 'bg-blue-100 text-blue-800';
                case 'Cancelled':
                    return 'bg-red-100 text-red-800';
                case 'On Hold':
                    return 'bg-gray-100 text-gray-800';
                default:
                    return 'bg-gray-100 text-gray-800';
            }
        }

        if (variant === 'category') {
            return 'bg-purple-100 text-purple-800';
        }

        if (variant === 'priority') {
            switch (singleValue) {
                case 'Critical':
                case 'High':
                case '3':
                    return 'bg-red-100 text-red-800';
                case 'Medium':
                case '2':
                    return 'bg-yellow-100 text-yellow-800';
                case 'Low':
                case '1':
                case '0':
                    return 'bg-green-100 text-green-800';
                default:
                    return 'bg-gray-100 text-gray-800';
            }
        }

        return 'bg-gray-100 text-gray-800';
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColorClasses()}`}>
            {singleValue}
        </span>
    );
}