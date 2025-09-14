import * as React from "react";

// Simple, minimal inline SVG icons to replace lucide-react usage.
// Keep footprint tiny; stroke uses currentColor.

type IconProps = React.SVGProps<SVGSVGElement>;

const base = "w-4 h-4";

function create(strokeWidth = 2, path: React.ReactNode, viewBox = "0 0 24 24") {
    return React.forwardRef<SVGSVGElement, IconProps>(function Icon(props, ref) {
        const { className = "", ...rest } = props;
        return (
            <svg
                ref={ref}
                viewBox={viewBox}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`${base} ${className}`.trim()}
                {...rest}
            >
                {path}
            </svg>
        );
    });
}

export const ZoomInIcon = create(2, <>
    <circle cx="11" cy="11" r="8" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
</>);

export const ZoomOutIcon = create(2, <>
    <circle cx="11" cy="11" r="8" />
    <line x1="8" y1="11" x2="14" y2="11" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
</>);

export const ChevronLeftIcon = create(2, <polyline points="15 18 9 12 15 6" />);
export const ChevronRightIcon = create(2, <polyline points="9 18 15 12 9 6" />);
export const ChevronDownIcon = create(2, <polyline points="6 9 12 15 18 9" />);
export const ChevronUpIcon = create(2, <polyline points="18 15 12 9 6 15" />);

export const XIcon = create(2, <line x1="18" y1="6" x2="6" y2="18" />, "0 0 24 24");

export const SearchIcon = create(2, <>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
</>);

export const UserIcon = create(2, <>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
</>);

export const UserXIcon = create(2, <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H4a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="17" y1="8" x2="23" y2="14" />
    <line x1="23" y1="8" x2="17" y2="14" />
</>);

export const GripVerticalIcon = create(2, <>
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="19" r="1" />
</>);

export const UploadIcon = create(2, <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
</>);

export const FileTextIcon = create(2, <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
</>);

export const CheckCircleIcon = create(2, <>
    <path d="M22 11.08V12A10 10 0 1 1 12 2" />
    <polyline points="22 4 12 14.01 9 11.01" />
</>);

export const AlertCircleIcon = create(2, <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12" y2="16" />
</>);

export const PlusIcon = create(2, <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
</>);

export const DownloadIcon = create(2, <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
</>);

export const SaveIcon = create(2, <>
    <path d="M17 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10l4-4V5a2 2 0 0 0-2-2Z" />
    <circle cx="12" cy="13" r="2" />
    <path d="M7 3v4h8" />
</>);

export const FolderOpenIcon = create(2, <>
    <path d="M3.34 7h5.32a2 2 0 0 0 1.52-.68l1.32-1.47A2 2 0 0 1 13.02 4h5.64A2.34 2.34 0 0 1 21 6.3v.7" />
    <path d="M3 7h18v10.7A2.3 2.3 0 0 1 18.7 20H5.3A2.3 2.3 0 0 1 3 17.7Z" />
</>);

export const Grid3X3Icon = create(2, <>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
</>);

export const UndoIcon = create(2, <path d="M3 7v6h6" />);
export const RotateCcwIcon = create(2, <path d="M3 7V3m0 4a10 10 0 1 1-3 7" />);

export const CalendarIcon = create(2, <>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
</>);

export const UsersIcon = create(2, <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
</>);

export const MoveIcon = create(2, <>
    <polyline points="5 9 2 12 5 15" />
    <polyline points="9 5 12 2 15 5" />
    <polyline points="15 19 12 22 9 19" />
    <polyline points="19 9 22 12 19 15" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="12" y1="2" x2="12" y2="22" />
</>);

export const Edit2Icon = create(2, <>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.375 2.625a1.767 1.767 0 0 1 2.5 2.5L12 14l-4 1 1-4Z" />
</>);

export const CheckIcon = create(2, <polyline points="20 6 9 17 4 12" />);

export const InfoIcon = create(2, <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="8" />
</>);

export const PanelLeftIcon = create(2, <>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M9 4v18" />
</>);

export const CircleIcon = create(2, <circle cx="12" cy="12" r="4" />);
export const MinusIcon = create(2, <line x1="5" y1="12" x2="19" y2="12" />);
export const MoreHorizontalIcon = create(2, <circle cx="12" cy="12" r="1" />);

// Additional common icons can be added here as needed.
