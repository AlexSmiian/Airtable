import React, {useState, useRef, memo, useEffect, useMemo} from "react";
import cln from "classnames";
import {useTableUpdate} from "@/features/Table/context/TableUpdateContext";
import styles from "./editableDecimalCell.module.scss";

interface EditableDecimalCellProps {
    initialValue: number | null | undefined;
    recordId: number;
    field: string;
    format?: 'currency' | 'decimal' | 'integer';
    currency?: string;
    decimals?: number;
    className?: string;
}

function EditableDecimalCell({
                                 initialValue,
                                 recordId,
                                 field,
                                 format = 'integer',
                                 currency = 'USD',
                                 decimals = 2,
                                 className = ""
                             }: EditableDecimalCellProps) {

    const {sendUpdate} = useTableUpdate();

    const [value, setValue] = useState(initialValue?.toString() || "");
    const [isEditing, setIsEditing] = useState(false);
    const safeInitialValue = useMemo(() => {
        return initialValue === null || initialValue === undefined ? "" : String(initialValue);
    }, [initialValue]);
    const originalValue = useRef(safeInitialValue);

    useEffect(() => {
        const newValue = initialValue?.toString() || "";
        if (value !== newValue) {
            setValue(newValue);
            originalValue.current = newValue;
        }
    }, [initialValue]);


    useEffect(() => {
        if (!isEditing) {
            setValue(safeInitialValue);
            originalValue.current = safeInitialValue;
        }
    }, [safeInitialValue, isEditing]);

    const sanitizeDecimal = (input: string) => {
        input = input.replace(/[+,eE]/gi, "");
        input = input.replace(/[^0-9.-]/g, "");

        if (input.includes("-")) {
            input = input.startsWith("-")
                ? "-" + input.slice(1).replace(/-/g, "")
                : input.replace(/-/g, "");
        }

        const parts = input.split(".");
        if (parts.length > 2) {
            input = parts[0] + "." + parts.slice(1).join("");
        }

        return input;
    };

    const handleSave = () => {
        setIsEditing(false);
        if (value === originalValue.current) return;

        const trimmed = value.trim();
        let valueToSend: number | null;

        if (trimmed === "") {
            valueToSend = null;
        } else {
            const parsed = parseFloat(trimmed);
            if (isNaN(parsed)) {
                setValue(originalValue.current);
                return;
            }
            valueToSend = parsed;
        }

        sendUpdate(recordId, field, valueToSend);
        originalValue.current = value;
    };

    const getCurrencySign = (currencyCode: string): string => {
        try {
            const formatted = (0).toLocaleString('uk-UA', {style: 'currency', currency: currencyCode});
            return formatted.replace(/[0-9\s.,]/g, '') || currencyCode;
        } catch {
            return currencyCode;
        }
    };

    const formatValue = (num?: number | null): string => {
        if (num === null || num === undefined) return "";
        switch (format) {
            case 'currency':
                return num.toLocaleString('uk-UA', {
                    style: 'currency',
                    currency,
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals
                });
            case 'decimal':
                return num.toLocaleString('uk-UA', {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals
                });
            case 'integer':
            default:
                return Math.round(num).toString();
        }
    };

    const currencySign = getCurrencySign(currency);
    const formatted = formatValue(parseFloat(value));

    if (!isEditing) {
        return (
            <div
                className={cln(styles.viewMode, className)}
                onClick={() => setIsEditing(true)}
                title="Клікніть для редагування"
            >
                {formatted}
            </div>
        );
    }

    return (
        <div className={styles.editWrapper}>
            <input
                type="text"
                value={value}
                autoFocus
                onFocus={() => (originalValue.current = value)}
                onBlur={handleSave}
                onInput={e => setValue(sanitizeDecimal((e.target as HTMLInputElement).value))}
                onKeyDown={e => {
                    if (e.key === "Enter") handleSave();
                    else if (e.key === "Escape") {
                        setValue(originalValue.current);
                        setIsEditing(false);
                    }
                }}
                className={cln(styles.editMode, className)}
            />
            {format === 'currency' && (
                <span className={styles.previewValue}>{currencySign}</span>
            )}
        </div>
    );
}

export default memo(EditableDecimalCell, (prev, next) =>
    prev.initialValue === next.initialValue &&
    prev.recordId === next.recordId &&
    prev.field === next.field
);
