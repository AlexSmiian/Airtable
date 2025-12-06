// src/features/Table/components/Columns.tsx
import React from 'react';
import { ColumnDef, createColumnHelper, CellContext } from "@tanstack/table-core";
import { IRecord } from "@/features/Table/types/table";
import { StatusBadge } from "./cells/StatusBadge";

const columnHelper = createColumnHelper<IRecord>();

export const columns: ColumnDef<IRecord, any>[] = [
    // 1. ID
    columnHelper.accessor("id", {
        id: 'id',
        header: () => "ID",
        cell: info => <div className="font-mono">{info.getValue()}</div>,
        enableHiding: false
    }),

    // 2. TITLE
    columnHelper.accessor("title", {
        id: 'title',
        header: () => "Title",
        cell: info => info.getValue(),
        enableSorting: true,
    }),

    // 3. DESCRIPTION
    columnHelper.accessor("description", {
        id: 'description',
        header: () => "Description",
        cell: info => info.getValue(),
        enableSorting: true,
    }),

    // 4. STATUS (З використанням StatusBadge)
    columnHelper.accessor("status", {
        id: 'status',
        header: () => "Status",
        // ✅ Передаємо весь об'єкт контексту 'info'
        cell: info => <StatusBadge {...info as CellContext<IRecord, IRecord['status']>} />,
        enableSorting: true,
    }),

    // 5. AMOUNT (Число)
    columnHelper.accessor("amount", {
        id: 'amount',
        header: () => "Amount",
        cell: info => (
            <div className="text-right font-medium">
                {Number(info.getValue()).toLocaleString('uk-UA', { style: 'currency', currency: 'USD' })}
            </div>
        ),
        enableSorting: true,
    }),


    columnHelper.accessor("is_active", {
        id: 'is_active',
        header: () => "Active",
        cell: info => (
            <span className={info.getValue() ? 'text-green-600' : 'text-red-600'}>
                {info.getValue() ? 'Так' : 'Ні'}
            </span>
        ),
        enableSorting: true,
    }),
];