import {JSX} from "react";

interface MetaValue {
    source: string;
    verified: boolean;
}

interface RenderMetaCellProps {
    meta: MetaValue | null | undefined;
}

export function RenderMetaCell({ meta }: RenderMetaCellProps): JSX.Element {
    if (!meta || typeof meta !== 'object') {
        return <span className="text-sm text-gray-400 italic">-</span>;
    }

    const getSourceColor = (source: string) => {
        switch (source.toLowerCase()) {
            case 'system':
                return 'bg-blue-100 text-blue-800';
            case 'user':
                return 'bg-green-100 text-green-800';
            case 'import':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="flex flex-col gap-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(meta.source)}`}>
                {meta.source}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                meta.verified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
            }`}>
                {meta.verified ? '✓ Verified' : '✗ Unverified'}
            </span>
        </div>
    );
}