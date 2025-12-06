import {JSX} from "react";

interface RenderBooleanCellProps {
    value: boolean | null | undefined;
    trueLabel?: string;
    falseLabel?: string;
}

export function RenderBooleanCell({
                                      value,
                                      trueLabel = 'Так',
                                      falseLabel = 'Ні'
                                  }: RenderBooleanCellProps): JSX.Element {
    if (value === null || value === undefined) {
        return <span className="text-sm text-gray-400 italic">-</span>;
    }

    return (
        <span className={`text-sm font-medium ${value ? 'text-green-600' : 'text-red-600'}`}>
            {value ? trueLabel : falseLabel}
        </span>
    );
}