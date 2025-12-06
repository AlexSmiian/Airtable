// src/features/Table/components/Table.tsx
'use client';

import React, { useRef } from 'react';
import { useQuery } from "@tanstack/react-query";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";
import { useVirtualizer } from '@tanstack/react-virtual';
import { IRecord } from "@/features/Table/types/table";
import { columns } from "@/features/Table/components/Columns";
import { fetchTableData } from "@/features/Table/api/tableApi";

export default function Table() {
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const { isPending, error, data } = useQuery<IRecord[], Error>({
        queryKey: ['tableData'],
        queryFn: fetchTableData,
    });

    const table = useReactTable<IRecord>({
        data: data ?? [],
        columns: columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const rowCount = table.getRowCount();

    const rowVirtualizer = useVirtualizer({
        count: rowCount,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => 36, // фіксована висота
        overscan: 20,
        measureElement: undefined, // вимикаємо вимірювання!
    });

    const virtualRows = rowVirtualizer.getVirtualItems();
    const totalSize = rowVirtualizer.getTotalSize();

    // ********* STATES *********
    if (isPending) {
        return (
            <div style={{ padding: '16px', textAlign: 'center', color: 'blue' }}>
                Завантаження даних...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '16px', textAlign: 'center', color: 'red' }}>
                Сталася помилка: {error.message}
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div style={{ padding: '16px', textAlign: 'center', color: 'gray' }}>
                Немає даних для відображення.
            </div>
        );
    }

    // ********* RENDER *********
    return (
        <div
            ref={tableContainerRef}
            style={{
                overflow: 'auto',
                maxHeight: '70vh',
                border: '1px solid #ccc',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
        >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead
                    style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 5,
                        backgroundColor: '#f9f9f9',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    }}
                >
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <th
                                key={header.id}
                                style={{
                                    padding: '12px 24px',
                                    textAlign: 'left',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                    color: '#555',
                                    letterSpacing: '1px'
                                }}
                            >
                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                        ))}
                    </tr>
                ))}
                </thead>

                {/* ========== ВІРТУАЛІЗОВАНЕ ТІЛО ТАБЛИЦІ ========== */}
                <tbody
                    style={{
                        position: "relative",
                        display: "table-row-group",
                    }}
                >
                {virtualRows.map(virtualRow => {
                    const row = table.getRowModel().rows[virtualRow.index];
                    if (!row) return null;

                    return (
                        <tr
                            key={row.id}
                            ref={rowVirtualizer.measureElement}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            {row.getVisibleCells().map(cell => (
                                <td
                                    key={cell.id}
                                    style={{
                                        padding: "16px 24px",
                                        whiteSpace: "nowrap",
                                        fontSize: "14px",
                                        color: "#111",
                                        width: `${cell.column.getSize()}px`,
                                        boxSizing: "border-box",
                                    }}
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    );
                })}

                {/* Spacer row — задає повну висоту таблиці */}
                <tr style={{ height: totalSize }} />
                </tbody>
            </table>
        </div>
    );
}
