interface Option {
    value: string;
    label: string;
}

interface MultiSelectFilterProps {
    label: string;
    options: Option[];
    selectedValues: string[];
    onChange: (selected: string[]) => void;
    mode?: 'single' | 'multiple';
}

export type { Option, MultiSelectFilterProps };