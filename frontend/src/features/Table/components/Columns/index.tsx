import React from 'react';
import { ColumnDef, createColumnHelper } from "@tanstack/table-core";
import { IRecord } from "@/features/Table/types/table";
import {RenderSelectCell} from "@/features/Table/components/cells/RenderSelectCell";
import {RenderNumberCell} from "@/features/Table/components/cells/RenderNumberCell";
import {RenderBooleanCell} from "@/features/Table/components/cells/RenderBooleanCell";
import {RenderArrayCell} from "@/features/Table/components/cells/RenderArrayCell";
import {RenderDateCell} from "@/features/Table/components/cells/RenderDateCell";
import {RenderMetaCell} from "@/features/Table/components/cells/RenderMetaCell";
import EditableCell from "@/features/Table/components/cells/EditableCell";
import EditableSelectCell from "@/features/Table/components/cells/EditableSelectCell";

const columnHelper = createColumnHelper<IRecord>();

export const columns: ColumnDef<IRecord, any>[] = [
    columnHelper.accessor("id", {
        id: 'id',
        header: () => "ID",
        cell: info => (
            <div className="font-mono text-sm text-gray-900">
                {info.getValue()}
            </div>
        ),
        enableHiding: false,
        enableSorting: true,
    }),

    columnHelper.accessor('title', {
        id: 'title',
        header: () => "Title",
        cell: info => (
            <EditableCell
                initialValue={info.getValue()}
                recordId={info.row.original.id}
                field="title"
            />
        ),
        enableSorting: true,
    }),

    columnHelper.accessor('firstnames', {
        id: 'firstnames',
        header: () => "First Name",
        cell: info => (
            <EditableCell
                initialValue={info.getValue()}
                recordId={info.row.original.id}
                field="firstnames"
            />
        ),
        enableSorting: true,
    }),

    columnHelper.accessor('lastnames', {
        id: 'lastnames',
        header: () => "Last Name",
        cell: info => (
            <EditableCell
                initialValue={info.getValue()}
                recordId={info.row.original.id}
                field="lastnames"
            />
        ),
        enableSorting: true,
    }),

    columnHelper.accessor('description', {
        id: 'description',
        header: () => "Description",
        cell: info => (
            <EditableCell
                initialValue={info.getValue()}
                recordId={info.row.original.id}
                field="description"
            />
        ),
        enableSorting: true,
    }),

    columnHelper.accessor('category', {
        id: 'category',
        header: () => "Category",
        cell: info => {
            const record = info.row.original;

            const displayValue = record.primary_category || info.getValue();

            return (
                <EditableSelectCell
                    value={displayValue ? displayValue.toString() : null}
                    recordId={record.id}
                    field="primary_category"
                    variant="category"
                />
            );
        },
    }),

    columnHelper.accessor('status', {
        id: 'status',
        header: () => "Status",
        cell: info => (
            <RenderSelectCell
                value={info.getValue()}
                variant="status"
            />
        ),
        enableSorting: true,
    }),

    columnHelper.accessor('amount', {
        id: 'amount',
        header: () => "Amount",
        cell: info => (
            <RenderNumberCell
                value={info.getValue()}
                format="currency"
                currency="USD"
                decimals={2}
            />
        ),
        enableSorting: true,
    }),

    columnHelper.accessor('quantity', {
        id: 'quantity',
        header: () => "Quantity",
        cell: info => (
            <RenderNumberCell
                value={info.getValue()}
                format="integer"
            />
        ),
        enableSorting: true,
    }),

    columnHelper.accessor('price', {
        id: 'price',
        header: () => "Price",
        cell: info => (
            <RenderNumberCell
                value={info.getValue()}
                format="currency"
                currency="USD"
                decimals={2}
            />
        ),
        enableSorting: true,
    }),

    columnHelper.accessor('rate', {
        id: 'rate',
        header: () => "Rate",
        cell: info => (
            <RenderNumberCell
                value={info.getValue()}
                format="decimal"
                decimals={4}
            />
        ),
        enableSorting: true,
    }),

    columnHelper.accessor('is_active', {
        id: 'is_active',
        header: () => "Active",
        cell: info => (
            <RenderBooleanCell
                value={info.getValue()}
                trueLabel="Так"
                falseLabel="Ні"
            />
        ),
        enableSorting: true,
    }),

    columnHelper.accessor('level', {
        id: 'level',
        header: () => "Level",
        cell: info => (
            <div className="text-center">
                <RenderNumberCell
                    value={info.getValue()}
                    format="integer"
                />
            </div>
        ),
        enableSorting: true,
    }),

    columnHelper.accessor('priority', {
        id: 'priority',
        header: () => "Priority",
        cell: info => {
            const value = info.getValue();
            const priorityMap: Record<number, string> = {
                0: 'Low',
                1: 'Low',
                2: 'Medium',
                3: 'High',
            };
            return (
                <RenderSelectCell
                    value={priorityMap[value] || String(value)}
                    variant="priority"
                />
            );
        },
        enableSorting: true,
    }),

    columnHelper.accessor('code', {
        id: 'code',
        header: () => "Code",
        cell: info => (
            <div className="font-mono text-sm text-gray-900">
                {info.getValue()}
            </div>
        ),
        enableSorting: true,
    }),

    columnHelper.accessor('group_id', {
        id: 'group_id',
        header: () => "Group",
        cell: info => (
            <div className="text-center">
                <RenderNumberCell
                    value={info.getValue()}
                    format="integer"
                />
            </div>
        ),
        enableSorting: true,
    }),

    columnHelper.accessor('tags', {
        id: 'tags',
        header: () => "Tags",
        cell: info => (
            <RenderArrayCell
                items={info.getValue()}
                variant="tags"
                maxVisible={3}
            />
        ),
        enableSorting: false,
    }),

    columnHelper.accessor('attributes', {
        id: 'attributes',
        header: () => "Attributes",
        cell: info => (
            <RenderArrayCell
                items={info.getValue()}
                variant="attributes"
                maxVisible={3}
            />
        ),
        enableSorting: false,
    }),

    columnHelper.accessor('comment', {
        id: 'comment',
        header: () => "Comment",
        cell: info => (
            <EditableCell
                initialValue={info.getValue()}
                recordId={info.row.original.id}
                field="comment"
            />
        ),
        enableSorting: false,
    }),

    columnHelper.accessor('created_at', {
        id: 'created_at',
        header: () => "Created",
        cell: info => (
            <RenderDateCell
                date={info.getValue()}
                format="date"
            />
        ),
        enableSorting: true,
    }),

    columnHelper.accessor('updated_at', {
        id: 'updated_at',
        header: () => "Updated",
        cell: info => (
            <RenderDateCell
                date={info.getValue()}
                format="date"
            />
        ),
        enableSorting: true,
    }),

    columnHelper.accessor('meta', {
        id: 'meta',
        header: () => "Meta",
        cell: info => (
            <RenderMetaCell meta={info.getValue()} />
        ),
        enableSorting: false,
    }),
];