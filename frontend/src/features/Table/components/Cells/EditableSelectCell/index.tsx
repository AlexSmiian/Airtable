"use client";

import React, {JSX, useState, useCallback, useMemo, useRef, useEffect, memo} from "react";
import {createPortal} from "react-dom";
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
    variant?: 'status' | 'category' | 'priority' | 'tag' | 'attribute' | 'level' | 'active' | 'meta';
}

const OPTIONS_MAP: Record<string, Option[]> = {
    status: [
        {label: 'Active', value: 'Active', colorClass: styles.bgGreen},
        {label: 'Pending', value: 'Pending', colorClass: styles.bgYellow},
        {label: 'Completed', value: 'Completed', colorClass: styles.bgBlue},
        {label: 'Cancelled', value: 'Cancelled', colorClass: styles.bgRed},
        {label: 'On Hold', value: 'On Hold', colorClass: styles.bgGray},
    ],
    priority: [
        {label: 'High', value: 'High', colorClass: styles.bgRed},
        {label: 'Medium', value: 'Medium', colorClass: styles.bgYellow},
        {label: 'Low', value: 'Low', colorClass: styles.bgGreen},
        {label: 'Critical', value: 'Critical', colorClass: styles.bgRed},
    ],
    category: [
        {label: 'Design', value: 'Design', colorClass: styles.bgPurple},
        {label: 'Development', value: 'Development', colorClass: styles.bgBlue},
        {label: 'Marketing', value: 'Marketing', colorClass: styles.bgYellow},
        {label: 'Sales', value: 'Sales', colorClass: styles.bgRed},
        {label: 'Support', value: 'Support', colorClass: styles.bgCyan},
    ],
    tag: [
        {label: 'Urgent', value: 'urgent', colorClass: styles.bgRed},
        {label: 'Review', value: 'review', colorClass: styles.bgYellow},
        {label: 'Approved', value: 'approved', colorClass: styles.bgGreen},
    ],
    attribute: [
        {label: 'Size', value: 'size', colorClass: styles.bgGray},
        {label: 'Color', value: 'color', colorClass: styles.bgGray},
        {label: 'Weight', value: 'weight', colorClass: styles.bgGray},
        {label: 'Height', value: 'height', colorClass: styles.bgGray},
        {label: 'Width', value: 'width', colorClass: styles.bgGray},
        {label: 'Depth', value: 'depth', colorClass: styles.bgGray},
        {label: 'Material', value: 'material', colorClass: styles.bgGray},
        {label: 'Brand', value: 'brand', colorClass: styles.bgGray},
        {label: 'Model', value: 'model', colorClass: styles.bgGray},
        {label: 'Capacity', value: 'capacity', colorClass: styles.bgGray},
        {label: 'Power', value: 'power', colorClass: styles.bgGray},
        {label: 'Voltage', value: 'voltage', colorClass: styles.bgGray},
        {label: 'Speed', value: 'speed', colorClass: styles.bgGray},
        {label: 'Temperature', value: 'temperature', colorClass: styles.bgGray},
        {label: 'Length', value: 'length', colorClass: styles.bgGray},
        {label: 'Diameter', value: 'diameter', colorClass: styles.bgGray},
    ],
    level: [
        {label: '1', value: '1', colorClass: styles.bgRed},
        {label: '2', value: '2', colorClass: styles.bgYellow},
        {label: '3', value: '3', colorClass: styles.bgGray},
        {label: '4', value: '4', colorClass: styles.bgBlue},
        {label: '5', value: '5', colorClass: styles.bgPurple},
        {label: '6', value: '6', colorClass: styles.bgGreen},
        {label: '7', value: '7', colorClass: styles.bgRed},
        {label: '8', value: '8', colorClass: styles.bgYellow},
    ],
    active: [
        {label: 'True', value: 'true', colorClass: styles.bgGreen},
        {label: 'False', value: 'false', colorClass: styles.bgRed},
        {label: 'Canceled', value: 'canceled', colorClass: styles.bgGray},
    ],
    meta: [
        {label: 'System', value: 'system', colorClass: styles.bgBlue},
        {label: 'User', value: 'user', colorClass: styles.bgGreen},
        {label: 'Import', value: 'import', colorClass: styles.bgYellow},
    ],
};

const EMPTY_OPTION_META: Option = {label: '— Видалити значення —', value: '', colorClass: styles.bgGray};


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
    const {sendUpdate} = useTableUpdate();
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({top: 0, left: 0, width: 0});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
    const containerRef = useRef<HTMLDivElement>(null);

    useOutsideClick(containerRef, () => setIsOpen(false));

    const currentOption = useMemo(() => getOptionData(variant, displayValue), [variant, displayValue]);

    const updateDropdownPosition = useCallback(() => {
        if (displayRef.current) {
            const rect = displayRef.current.getBoundingClientRect();
            const dropdownHeight = 300;
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            let top = rect.bottom + 4;

            if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
                top = rect.top - Math.min(dropdownHeight, spaceAbove) - 4;
            }

            setDropdownPosition({
                top: top,
                left: rect.left,
                width: Math.max(rect.width, 150)
            });
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            updateDropdownPosition();
            window.addEventListener('scroll', updateDropdownPosition, true);
            window.addEventListener('resize', updateDropdownPosition);

            return () => {
                window.removeEventListener('scroll', updateDropdownPosition, true);
                window.removeEventListener('resize', updateDropdownPosition);
            };
        }
    }, [isOpen, updateDropdownPosition]);

    const handleSelect = useCallback((newValue: string) => {
        const updateValue = newValue === '' ? null : newValue;
        const currentLocalValue = displayValue;

        setIsOpen(false);

        if (updateValue !== currentLocalValue) {
            setDisplayValue(updateValue);
            sendUpdate(recordId, field, updateValue);
        }
    }, [recordId, field, displayValue, sendUpdate]);

    const handleToggle = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    return (
        <>
            <div className={styles.cellWrapper} ref={displayRef}>
                <span
                    className={cln(styles.selectDisplay, currentOption?.colorClass || styles.bgGray)}
                    onClick={handleToggle}
                >
                    {displayValue || <span className={styles.empty}>—</span>}
                </span>
            </div>
            {isOpen && mounted && createPortal(
                <div
                    ref={containerRef}
                    className={styles.dropdownContainer}
                    style={{
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        width: `${dropdownPosition.width}px`,
                    }}
                >
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
                </div>,
                document.body
            )}
        </>
    );
}

export default memo(EditableSelectCell, (prev, next) => {
    return prev.value === next.value &&
        prev.recordId === next.recordId &&
        prev.field === next.field &&
        prev.variant === next.variant;
});