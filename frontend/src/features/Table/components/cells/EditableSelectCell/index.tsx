import React, {JSX, useState, useCallback, useMemo, useRef, useEffect, memo} from "react";
import styles from "./editableSelectCell.module.scss";
import cln from "classnames";
import {useTableUpdate} from "@/features/Table/context/TableUpdateContext";
import {useOutsideClick} from "@/features/Table/hooks/useOutsideClick";

interface Option {
    label: string;
    value: string;
    colorClass: string;
}

interface SelectCellProps {
    value: string | null | undefined;
    recordId: number;
    field: string;
    variant?: 'status' | 'category' | 'priority' | 'tag' | 'attribute';
}

const OPTIONS_MAP: Record<string, Option[]> = {
    status: [
        { label: 'Active', value: 'Active', colorClass: styles.bgGreen },
        { label: 'Pending', value: 'Pending', colorClass: styles.bgYellow },
        { label: 'Completed', value: 'Completed', colorClass: styles.bgBlue },
        { label: 'Cancelled', value: 'Cancelled', colorClass: styles.bgRed },
        { label: 'On Hold', value: 'On Hold', colorClass: styles.bgGray },
    ],
    priority: [
        { label: 'High', value: '3', colorClass: styles.bgRed },
        { label: 'Medium', value: '2', colorClass: styles.bgYellow },
        { label: 'Low', value: '1', colorClass: styles.bgGreen },
    ],
    category: [
        { label: 'Design', value: 'Design', colorClass: styles.bgPurple },
        { label: 'Development', value: 'Development', colorClass: styles.bgBlue },
        { label: 'Marketing', value: 'Marketing', colorClass: styles.bgYellow },
        { label: 'Sales', value: 'Sales', colorClass: styles.bgRed },
        { label: 'Support', value: 'Support', colorClass: styles.bgCyan },
    ],
    tag: [
        { label: 'Urgent', value: 'urgent', colorClass: styles.bgRed },
        { label: 'Review', value: 'review', colorClass: styles.bgYellow },
        { label: 'Approved', value: 'approved', colorClass: styles.bgGreen },
    ],
    attribute: [
        { label: 'Size', value: 'size', colorClass: styles.bgGray },
        { label: 'Color', value: 'color', colorClass: styles.bgGray },
        { label: 'Weight', value: 'weight', colorClass: styles.bgGray },
    ]
};

const EMPTY_OPTION_META: Option = { label: '— Видалити значення —', value: '', colorClass: styles.bgGray};


const getOptionData = (variant: string, singleValue: string | null): Option | undefined => {
    if (!singleValue || singleValue === '') return EMPTY_OPTION_META;

    const options = OPTIONS_MAP[variant];
    if (!options) return undefined;

    if (variant === 'priority') {
        return options.find(opt => opt.value === singleValue || opt.label.toUpperCase() === singleValue.toUpperCase())
            || options.find(opt => opt.value === singleValue);
    }

    return options.find(opt => opt.value === singleValue);
};


function EditableSelectCell({
                                value: initialValue,
                                recordId,
                                field,
                                variant = 'status',
                            }: SelectCellProps): JSX.Element {
    const { sendUpdate } = useTableUpdate();
    const [isOpen, setIsOpen] = useState(false);

    const cachedValueFromProps = useMemo(() => {
        if (!initialValue) return null;
        const rawString = String(initialValue).trim();
        return rawString === '' ? null : rawString;
    }, [initialValue]);

    const [displayValue, setDisplayValue] = useState(cachedValueFromProps);

    useEffect(() => {
        if (displayValue !== cachedValueFromProps) {
            setDisplayValue(cachedValueFromProps);
        }
    }, [cachedValueFromProps]);


    const baseOptions = OPTIONS_MAP[variant] || OPTIONS_MAP['status'];

    const optionsWithEmpty = useMemo(() => {
        return [{...EMPTY_OPTION_META, colorClass: ''}, ...baseOptions];
    }, [baseOptions]);


    const displayRef = useRef<HTMLDivElement>(null);
    useOutsideClick(displayRef, () => setIsOpen(false));

    const currentOption = useMemo(() => getOptionData(variant, displayValue), [variant, displayValue]);

    const handleSelect = useCallback((newValue: string) => {

        const updateValue = newValue === '' ? null : newValue;
        const currentLocalValue = displayValue;

        setIsOpen(false);

        if (updateValue !== currentLocalValue) {
            setDisplayValue(updateValue);
            sendUpdate(recordId, field, updateValue);
        }

    }, [recordId, field, displayValue, sendUpdate]);


    const Display = (
        <span
            className={cln(styles.selectDisplay, currentOption?.colorClass || styles.bgGray)}
            onClick={() => setIsOpen(prev => !prev)}
        >
            {displayValue
                ? displayValue
                : <span className={styles.empty}>—</span>}
        </span>
    );

    return (
        <div style={{position:'relative'}} ref={displayRef}>
            <div className={styles.cellWrapper}>
                {Display}
            </div>
            {isOpen && (
                <div className={styles.dropdownContainer}>
                    {optionsWithEmpty.map((option) => (
                        <div
                            key={option.value || 'empty-reset'}
                            className={cln(styles.dropdownItem, {
                                [styles.selected]: option.value === (displayValue || ''),
                                [option.colorClass]: !!option.colorClass,
                                [styles.emptyOption]: option.value === '',
                            })}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default memo(EditableSelectCell, (prev, next) => {
    return prev.value === next.value &&
        prev.recordId === next.recordId &&
        prev.field === next.field &&
        prev.variant === next.variant;
});