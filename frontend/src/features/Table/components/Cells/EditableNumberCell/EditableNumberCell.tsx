import React, { useState, useRef, memo, useEffect, useCallback, useMemo } from "react";
import cln from "classnames";
import { useTableUpdate } from "@/features/Table/context/TableUpdateContext";
import styles from "./editableNumberCell.module.scss";

interface EditableCellProps {
    initialValue: number | null | undefined;
    recordId: number;
    field: string;
    className?: string;
}

function EditableNumberCell({
                                initialValue,
                                recordId,
                                field,
                                className = ""
                            }: EditableCellProps) {
    const { sendUpdate } = useTableUpdate();
    const [isEditing, setIsEditing] = useState(false);

    const safeInitialValue = useMemo(() => {
        return initialValue === null || initialValue === undefined ? "" : String(initialValue);
    }, [initialValue]);

    const [value, setValue] = useState(safeInitialValue);
    const originalValue = useRef(safeInitialValue);

    useEffect(() => {
        if (!isEditing) {
            setValue(safeInitialValue);
            originalValue.current = safeInitialValue;
        }
    }, [safeInitialValue, isEditing]);

    const handleSave = useCallback(() => {
        setIsEditing(false);

        if (value === originalValue.current) return;

        let valueToSend: number | null;

        if (value === "") {
            valueToSend = null;
        } else {
            const num = Number(value);

            if (isNaN(num)) {
                console.error("Недійсне число:", value);
                setValue(originalValue.current);
                return;
            }

            valueToSend = Math.trunc(num);
        }

        sendUpdate(recordId, field, valueToSend);
        originalValue.current = value;

    }, [recordId, field, value, sendUpdate]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSave();
        else if (e.key === "Escape") {
            setValue(originalValue.current);
            setIsEditing(false);
        }
    };

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;

        if (/[.,+eE]/.test(input)) return;

        let filtered = input.replace(/[^0-9-]/g, "");

        if (filtered.includes("-")) {
            filtered =
                filtered.startsWith("-")
                    ? "-" + filtered.slice(1).replace(/-/g, "")
                    : filtered.replace(/-/g, "");
        }

        setValue(filtered);
    }, []);

    if (!isEditing) {
        return (
            <div
                className={cln(styles.viewMode, className)}
                onClick={() => setIsEditing(true)}
                title="Клікніть для редагування"
            >
                {value || <span className={styles.empty}>—</span>}
            </div>
        );
    }

    return (
        <input
            type="text"
            inputMode="numeric"
            value={value}
            autoFocus
            onFocus={() => { originalValue.current = value; }}
            onBlur={handleSave}
            onInput={handleChange}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={cln(styles.editMode, className)}
        />
    );
}

export default memo(EditableNumberCell, (prev, next) => {
    return prev.initialValue === next.initialValue &&
        prev.recordId === next.recordId &&
        prev.field === next.field;
});
