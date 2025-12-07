import React, {useState, useRef, memo, useEffect} from "react";
import cln from "classnames";
import {useTableUpdate} from "@/features/Table/context/TableUpdateContext";
import styles from "./editableCell.module.scss";

interface EditableCellProps {
    initialValue: string | null | undefined;
    recordId: number;
    field: string;
    className?: string;
}

function EditableCell({
                          initialValue,
                          recordId,
                          field,
                          className = ""
                      }: EditableCellProps) {
    const {sendUpdate} = useTableUpdate();
    const [value, setValue] = useState(initialValue || "");
    const [isEditing, setIsEditing] = useState(false);
    const originalValue = useRef(initialValue);

    useEffect(() => {
        const newValue = initialValue || "";
        if (value !== newValue) {
            setValue(newValue);
            originalValue.current = newValue;
        }
    }, [initialValue]);


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
            value={value}
            autoFocus
            onFocus={() => originalValue.current = value}
            onBlur={() => {
                setIsEditing(false);
                if (value !== originalValue.current) {
                    sendUpdate(recordId, field, value);
                }
            }}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => {
                if (e.key === "Enter") {
                    setIsEditing(false);
                    if (value !== originalValue.current) {
                        sendUpdate(recordId, field, value);
                    }
                } else if (e.key === "Escape") {
                    setValue(originalValue.current || "");
                    setIsEditing(false);
                }
            }}
            className={cln(styles.editMode, className)}
        />
    );
}

export default memo(EditableCell, (prev, next) => {
    return prev.initialValue === next.initialValue &&
        prev.recordId === next.recordId &&
        prev.field === next.field;
});