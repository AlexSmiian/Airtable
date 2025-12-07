import React from 'react';
import {ColumnDef, createColumnHelper} from "@tanstack/table-core";
import {IRecord} from "@/features/Table/types/table";
import EditableCell from "@/features/Table/components/Cells/EditableCell";
import EditableSelectCell from "@/features/Table/components/Cells/EditableSelectCell";
import EditableNumberCell from "@/features/Table/components/Cells/EditableNumberCell/EditableNumberCell";
import EditableDecimalCell from "@/features/Table/components/Cells/EditableDecimalCell";
import EditableRateCell from "@/features/Table/components/Cells/EditableRateCell";
import EditableDateCell from "@/features/Table/components/Cells/EditableDateCell";

const columnHelper = createColumnHelper<IRecord>();

export const columns: ColumnDef<IRecord, any>[] = [
        columnHelper.accessor("id", {
            id: 'id',
            header: () => "ID",
            cell: info => (
                <div>
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

        columnHelper.accessor('first_names', {
            id: 'firstnames',
            header: () => "First Name",
            cell: info => (
                <EditableCell
                    initialValue={info.getValue()}
                    recordId={info.row.original.id}
                    field="first_names"
                />
            ),
            enableSorting: true,
        }),

        columnHelper.accessor('last_names', {
            id: 'last_names',
            header: () => "Last Name",
            cell: info => (
                <EditableCell
                    initialValue={info.getValue()}
                    recordId={info.row.original.id}
                    field="last_names"
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
            cell: info => {
                const record = info.row.original;
                const displayValue = record.primary_status || info.getValue();

                return (
                    <EditableSelectCell
                        value={displayValue ? displayValue.toString() : null}
                        recordId={record.id}
                        field="primary_status"
                        variant="status"
                    />
                );
            },
            enableSorting: true,
        }),

        columnHelper.accessor('amount', {
            id: 'amount',
            header: () => "Amount",
            cell: info => (
                <EditableDecimalCell
                    initialValue={info.getValue()}
                    recordId={info.row.original.id}
                    format="currency"
                    currency="USD"
                    decimals={2}
                    field="amount"
                />
            ),
            enableSorting: true,
        }),

        columnHelper.accessor('quantity', {
            id: 'quantity',
            header: () => "Quantity",
            cell: info => (
                <EditableNumberCell
                    initialValue={info.getValue()}
                    recordId={info.row.original.id}
                    field="quantity"
                />
            ),
            enableSorting: true,
        }),

        columnHelper.accessor('price', {
            id: 'price',
            header: () => "Price",
            cell: info => (
                <EditableDecimalCell
                    initialValue={info.getValue()}
                    recordId={info.row.original.id}
                    format="currency"
                    currency="USD"
                    decimals={2}
                    field="price"
                />
            ),
            enableSorting: true,
        }),

        columnHelper.accessor('rate', {
            id: 'rate',
            header: () => "Rate",
            cell: info => (
                <EditableRateCell
                    initialValue={info.getValue()}
                    recordId={info.row.original.id}
                    field="rate"
                    showAsPercentage={true}
                    decimals={4}
                />
            ),
            enableSorting: true,
        }),

        columnHelper.accessor('is_active', {
            id: 'is_active',
            header: () => "Active",
            cell: info => {
                const record = info.row.original;
                const displayValue = record.primary_is_active || info.getValue();

                return (
                    <EditableSelectCell
                        value={displayValue ? displayValue.toString() : null}
                        recordId={record.id}
                        field="primary_is_active"
                        variant="active"
                    />
                );
            },
            enableSorting: true,
        }),

        columnHelper.accessor('level', {
            id: 'level',
            header: () => "Level",
            cell: info => {
                const record = info.row.original;
                const displayValue = record.primary_level || info.getValue();

                return (
                    <EditableSelectCell
                        value={displayValue ? displayValue.toString() : null}
                        recordId={record.id}
                        field="primary_level"
                        variant="level"
                    />
                );
            },
        }),

        columnHelper.accessor('priority', {
            id: 'priority',
            header: () => "Priority",
            cell: info => {
                const record = info.row.original;
                const displayValue = record.primary_priority || info.getValue();

                return (
                    <EditableSelectCell
                        value={displayValue ? displayValue.toString() : null}
                        recordId={record.id}
                        field="primary_priority"
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
                <EditableCell
                    initialValue={info.getValue()}
                    recordId={info.row.original.id}
                    field="code"
                />
            ),
            enableSorting: true,
        }),

        columnHelper.accessor('group_id', {
            id: 'group_id',
            header: () => "Group",
            cell: info => (
                <EditableNumberCell
                    initialValue={info.getValue()}
                    recordId={info.row.original.id}
                    field="group_id"
                />
            ),
            enableSorting: true,
        }),

        columnHelper.accessor('tags', {
            id: 'tags',
            header: () => "Tags",
            cell: info => {
                const record = info.row.original;
                const displayValue = record.primary_tag || info.getValue();

                return (
                    <EditableSelectCell
                        value={displayValue ? displayValue.toString() : null}
                        recordId={record.id}
                        field="primary_tag"
                        variant="tag"
                    />
                );
            },
        }),

        columnHelper.accessor('attributes', {
            id: 'attributes',
            header: () => "Attributes",
            cell: info => {
                const record = info.row.original;
                const displayValue = record.primary_attribute || info.getValue();

                return (
                    <EditableSelectCell
                        value={displayValue ? displayValue.toString() : null}
                        recordId={record.id}
                        field="primary_attribute"
                        variant="attribute"
                    />
                );
            },
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
                <EditableDateCell
                    initialValue={info.getValue()}
                    recordId={info.row.original.id}
                    field="created_at"
                    format="date"
                />
            ),
            enableSorting: true,
        }),

        columnHelper.accessor('updated_at', {
            id: 'updated_at',
            header: () => "Updated",
            cell: info => (
                <EditableDateCell
                    initialValue={info.getValue()}
                    recordId={info.row.original.id}
                    field="updated_at"
                    format="date"
                    readOnly={true}
                />
            ),
            enableSorting: true,
        }),

        columnHelper.accessor('meta', {
            id: 'meta',
            header: () => "Meta",
            cell: info => {
                const record = info.row.original;
                const displayValue = record.primary_meta || info.getValue();

                return (
                    <EditableSelectCell
                        value={displayValue ? displayValue.toString() : null}
                        recordId={record.id}
                        field="primary_meta"
                        variant="tag"
                    />
                );
            },
        }),
    ]
;