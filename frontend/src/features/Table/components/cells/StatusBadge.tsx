// src/features/Table/components/cells/StatusBadge.tsx
import React from 'react';
import { CellContext } from '@tanstack/react-table';
import { IRecord } from '@/features/Table/types/table';

// Тип значення статусу
type StatusValue = IRecord['status'];

// Компонент очікує повний CellContext
export function StatusBadge(props: CellContext<IRecord, StatusValue>) {
    const status = props.getValue();

    let statusClass = 'bg-gray-500';

    switch (status) {
        case 'Active':
            statusClass = 'bg-blue-600';
            break;
        case 'Completed':
            statusClass = 'bg-green-600';
            break;
        case 'Pending':
            statusClass = 'bg-yellow-600';
            break;
        case 'Cancelled':
            statusClass = 'bg-red-600';
            break;
        default:
            statusClass = 'bg-gray-500';
            break;
    }

    return (
        <span
            className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${statusClass}`}
        >
            {status}
        </span>
    );
}