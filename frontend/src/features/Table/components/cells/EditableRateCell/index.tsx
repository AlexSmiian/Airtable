import React, {useState, useRef, memo, useEffect, useMemo} from "react";
import cln from "classnames";
import { useTableUpdate } from "@/features/Table/context/TableUpdateContext";
import styles from "./editableRateCell.module.scss";

interface EditableRateCellProps {
    initialValue: number | null | undefined;
    recordId: number;
    field: string;
    decimals?: number;
    showAsPercentage?: boolean;
    className?: string;
}

function EditableRateCell({
                              initialValue,
                              recordId,
                              field,
                              decimals = 4,
                              showAsPercentage = false,
                              className = ""
                          }: EditableRateCellProps) {

    const { sendUpdate } = useTableUpdate();

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

    const formatValue = (num?: number | null): string => {
        if (num === null || num === undefined) return "";

        if (showAsPercentage) {
            const percentage = num * 100;
            return percentage.toLocaleString('uk-UA', {
                minimumFractionDigits: decimals - 2,
                maximumFractionDigits: decimals - 2
            }) + '%';
        }

        return num.toLocaleString('uk-UA', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

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
                type="number"
                step="0.01"
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
            {showAsPercentage && (
                <span className={styles.previewValue}>%</span>
            )}
        </div>
    );
}

export default memo(EditableRateCell, (prev, next) =>
    prev.initialValue === next.initialValue &&
    prev.recordId === next.recordId &&
    prev.field === next.field
);