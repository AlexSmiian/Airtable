import {useEffect, RefObject} from 'react';

export const useOutsideClick = (
    ref: RefObject<HTMLElement | null>,
    callback: () => void
) => {
    useEffect(() => {
        const handleClickOutside = (event: Event) => {
            const target = event.target as Node;
            if (!ref.current) return;

            if (ref.current.contains(target)) return;
            callback();
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [ref, callback]);
};
