"use client";

import React, { useState, useRef, memo, useEffect } from "react";
import cln from "classnames";
import { useTableUpdate } from "@/features/Table/context/TableUpdateContext";
import styles from "./editableDateCell.module.scss";

// SVG Calendar Icon Component
const CalendarIcon = ({ className, size = 14 }: { className?: string; size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

interface EditableDateCellProps {
    initialValue: string | Date | null | undefined;
    recordId: number;
    field: string;
    format?: 'date' | 'datetime' | 'time';
    className?: string;
}

function EditableDateCell({
                              initialValue,
                              recordId,
                              field,
                              format = 'date',
                              className = ""
                          }: EditableDateCellProps) {

    const { sendUpdate } = useTableUpdate();
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState("");
    const originalValue = useRef("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const formattedValue = formatToInput(initialValue);
        setValue(formattedValue);
        originalValue.current = formattedValue;
    }, [initialValue]);

    const formatToInput = (date: string | Date | null | undefined): string => {
        if (!date) return "";

        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) return "";

        switch (format) {
            case 'datetime':
                return dateObj.toISOString().slice(0, 16);
            case 'time':
                const hours = String(dateObj.getHours()).padStart(2, '0');
                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                return `${hours}:${minutes}`;
            case 'date':
            default:
                return dateObj.toISOString().split('T')[0];
        }
    };

    const formatDisplay = (date: string | Date | null | undefined): string => {
        if (!date) return "-";

        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) return "Invalid date";

        switch (format) {
            case 'datetime':
                return dateObj.toLocaleString('uk-UA', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            case 'time':
                return dateObj.toLocaleTimeString('uk-UA', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            case 'date':
            default:
                return dateObj.toLocaleDateString('uk-UA');
        }
    };

    const handleSave = () => {
        setIsEditing(false);
        if (value === originalValue.current) return;

        let valueToSend: string | null;

        if (value.trim() === "") {
            valueToSend = null;
        } else {
            const dateObj = new Date(value);
            if (isNaN(dateObj.getTime())) {
                setValue(originalValue.current);
                return;
            }
            valueToSend = dateObj.toISOString();
        }

        sendUpdate(recordId, field, valueToSend);
        originalValue.current = value;
    };

    const handleCancel = () => {
        setValue(originalValue.current);
        setIsEditing(false);
    };

    const getInputType = (): string => {
        switch (format) {
            case 'datetime':
                return 'datetime-local';
            case 'time':
                return 'time';
            case 'date':
            default:
                return 'date';
        }
    };

    if (!isEditing) {
        return (
            <div
                className={cln(styles.viewMode, className)}
                onClick={() => setIsEditing(true)}
                title="Клікніть для редагування"
            >
                <CalendarIcon className={styles.icon} size={14} />
                <span className={styles.dateText}>
                    {formatDisplay(initialValue)}
                </span>
            </div>
        );
    }

    return (
        <div className={styles.editWrapper}>
            <input
                ref={inputRef}
                type={getInputType()}
                value={value}
                autoFocus
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleSave();
                    } else if (e.key === "Escape") {
                        handleCancel();
                    }
                }}
                className={cln(styles.editMode, className)}
            />
        </div>
    );
}

export default memo(EditableDateCell, (prev, next) =>
    prev.initialValue === next.initialValue &&
    prev.recordId === next.recordId &&
    prev.field === next.field
);