'use client';

import React, { useRef, useCallback } from 'react';
import {
    useInfiniteQuery,
    QueryFunctionContext,

    InfiniteData
} from "@tanstack/react-query";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";
import { useVirtualizer } from '@tanstack/react-virtual';
import { IRecord } from "@/features/Table/types/table";
import { columns } from "@/features/Table/components/Columns";
import { fetchTableData } from "@/features/Table/api/tableApi";
import styles from "./table.module.scss";

const PAGE_SIZE = 50;
type PageParamType = number;

export default function Index() {
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const {
        data,
        isFetching,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
        error,
    } = useInfiniteQuery<IRecord[], Error, InfiniteData<IRecord[]>, string[], PageParamType>({

        queryKey: ['tableData'],

        queryFn: ({ pageParam = 0 }: QueryFunctionContext<string[], PageParamType>) =>
            fetchTableData(pageParam, PAGE_SIZE),

        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < PAGE_SIZE) return undefined;
            return allPages.length * PAGE_SIZE;
        },
        initialPageParam: 0,
    });

    const tableData = data?.pages.flat() ?? [];

    const table = useReactTable<IRecord>({
        data: tableData,
        columns: columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const rowCount = table.getRowCount();

    const rowVirtualizer = useVirtualizer({
        count: rowCount,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => 48,
        overscan: 20,
    });

    const virtualRows = rowVirtualizer.getVirtualItems();
    const totalSize = rowVirtualizer.getTotalSize();

    const handleScroll = useCallback(() => {
        const container = tableContainerRef.current;
        if (!container) return;

        const { scrollTop, scrollHeight, offsetHeight } = container;

        const scrollThreshold = 200;
        if (
            hasNextPage &&
            scrollTop + offsetHeight >= scrollHeight - scrollThreshold &&
            !isFetchingNextPage
        ) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);


    if (isFetching && !tableData.length) {
        return (
            <div className={styles.loadingState}>
                <div>Завантаження даних...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorState}>
                <div>Сталася помилка: {error.message}</div>
            </div>
        );
    }

    if (!tableData.length) {
        return (
            <div className={styles.emptyState}>
                <div>Немає даних для відображення.</div>
            </div>
        );
    }

    return (
        <div
            ref={tableContainerRef}
            className={styles.wrapper}
            onScroll={handleScroll}
        >
            <div className={styles.table}>
                <div className={styles.header}>
                    {table.getHeaderGroups().map(headerGroup => (
                        <div key={headerGroup.id} className={styles.headerRow}>
                            {headerGroup.headers.map(header => {
                                const size = header.getSize();
                                const isFlexible = size === 150;
                                return (
                                    <div
                                        key={header.id}
                                        className={styles.headerCell}
                                        style={{
                                            flex: isFlexible ? '1 1 0%' : `0 0 ${size}px`,
                                            minWidth: isFlexible ? '150px' : `${size}px`,
                                        }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div
                    className={styles.body}
                    style={{ height: `${totalSize}px` }}
                >
                    {virtualRows.map(virtualRow => {
                        const row = table.getRowModel().rows[virtualRow.index];
                        if (!row) return null;

                        return (
                            <div
                                key={row.id}
                                data-index={virtualRow.index}
                                ref={rowVirtualizer.measureElement}
                                className={styles.row}
                                style={{
                                    transform: `translateY(${virtualRow.start}px)`,
                                    position: 'absolute',
                                    width: '100%',
                                }}
                            >
                                {row.getVisibleCells().map(cell => {
                                    const size = cell.column.getSize();
                                    const isFlexible = size === 150;

                                    return (
                                        <div
                                            key={cell.id}
                                            className={styles.cell}
                                            style={{
                                                flex: isFlexible ? '1 1 0%' : `0 0 ${size}px`,
                                                minWidth: isFlexible ? '150px' : `${size}px`,
                                            }}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                    {isFetchingNextPage && (

                        <div
                            className={styles.loadingMore}
                            style={{
                                transform: `translateY(${totalSize}px)`,
                                position: 'absolute',
                                width: '100%',
                            }}
                        >
                            Завантаження ще...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}