import React, { useRef, useState, useEffect } from "react";
import { TableData, Guest } from "./TablePlanner";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { toast } from "sonner@2.0.3";
import { SeatContextMenu } from "./SeatContextMenu";
import { TableInfoDialog } from "./TableInfoDialog";
import { XIcon as X, MoveIcon as Move, Edit2Icon as Edit2, CheckIcon as Check, InfoIcon as Info } from "./icons";
import { generateSeatLayout } from "./seatLayout";

interface TableProps {
    table: TableData;
    isSelected: boolean;
    allGuests: Guest[];
    allTables: TableData[];
    onSelect: (tableId: string | null) => void;
    onAssignGuest: (guestId: string, tableId: string, seatNumber?: number) => void;
    onRemoveGuest: (guestId: string) => void;
    onRemoveTable: (tableId: string) => void;
    onMoveTable: (tableId: string, x: number, y: number) => void;
    onRenameTable: (tableId: string, newName: string) => void;
    onReorderGuests: (tableId: string, orderedGuestIds: string[]) => void;
    onUpdateTableConfig: (tableId: string, config: { seats?: number; desiredMinSeats?: number; desiredMaxSeats?: number }) => void;
}

export function Table({
    table,
    isSelected,
    allGuests,
    allTables,
    onSelect,
    onAssignGuest,
    onRemoveGuest,
    onRemoveTable,
    onRenameTable,
    onReorderGuests,
    onUpdateTableConfig,
}: TableProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(table.name);
    const inputRef = useRef<HTMLInputElement>(null);

    // Context menu state
    const [contextMenu, setContextMenu] = useState<{
        isOpen: boolean;
        position: { x: number; y: number };
        seatNumber: number;
        currentGuest?: Guest;
    }>({
        isOpen: false,
        position: { x: 0, y: 0 },
        seatNumber: 0,
    });

    const [showInfoDialog, setShowInfoDialog] = useState(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [showConfigDialog, setShowConfigDialog] = useState(false);

    const [cfgSeats, setCfgSeats] = useState(table.seats);
    const [cfgMin, setCfgMin] = useState(table.desiredMinSeats);
    const [cfgMax, setCfgMax] = useState(table.desiredMaxSeats);
    const [cfgName, setCfgName] = useState(table.name);

    useEffect(() => {
        // Sync when table changes (e.g., external update)
        setCfgSeats(table.seats);
        setCfgMin(table.desiredMinSeats);
        setCfgMax(table.desiredMaxSeats);
    }, [table.seats, table.desiredMinSeats, table.desiredMaxSeats]);
    useEffect(() => {
        setCfgName(table.name);
    }, [table.name]);

    const configValidation = () => {
        if (cfgSeats < table.guests.length) return `Cannot set seats below current assigned (${table.guests.length})`;
        if (cfgSeats < 1) return "Seats must be >=1";
        if (cfgMin < 0) return "Min cannot be negative";
        if (cfgMax < 1) return "Max must be >=1";
        if (cfgMin > cfgMax) return "Min cannot exceed Max";
        if (cfgMax > cfgSeats) return "Max cannot exceed Seats";
        if (cfgMin > cfgSeats) return "Min cannot exceed Seats";
        if (!cfgName.trim()) return "Name required";
        return null;
    };

    const handleConfigSave = () => {
        const err = configValidation();
        if (err) {
            toast.error(err);
            return;
        }
        if (cfgName.trim() && cfgName.trim() !== table.name) {
            onRenameTable(table.id, cfgName.trim());
        }
        onUpdateTableConfig(table.id, { seats: cfgSeats, desiredMinSeats: cfgMin, desiredMaxSeats: cfgMax });
        toast.success("Table updated");
        setShowConfigDialog(false);
    };

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleNameEdit = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setIsEditing(true);
        setEditName(table.name);
    };

    const handleNameSave = () => {
        if (editName.trim() && editName.trim() !== table.name) {
            onRenameTable(table.id, editName.trim());
        }
        setIsEditing(false);
    };

    const handleNameCancel = () => {
        setEditName(table.name);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleNameSave();
        } else if (e.key === "Escape") {
            handleNameCancel();
        }
    };

    const dragHandleRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleTableDragStart = (e: React.DragEvent) => {
        setIsDragging(true);
        e.dataTransfer.setData(
            "application/json",
            JSON.stringify({
                type: "table",
                id: table.id,
                x: table.x,
                y: table.y,
            })
        );
        e.dataTransfer.effectAllowed = "move";
    };

    const handleTableDragEnd = () => {
        setIsDragging(false);
    };

    const handleSeatClick = (e: React.MouseEvent, seatIndex: number) => {
        e.stopPropagation(); // prevent table selection loss
        const guest = table.guests[seatIndex];

        setContextMenu({
            isOpen: true,
            position: { x: e.clientX, y: e.clientY },
            seatNumber: seatIndex + 1,
            currentGuest: guest,
        });
    };

    const handleContextMenuClose = () => {
        setContextMenu((prev) => ({ ...prev, isOpen: false }));
    };

    const handleAssignGuestToSeat = (guestId: string, seatNumber: number) => {
        onAssignGuest(guestId, table.id, seatNumber - 1); // Convert back to 0-based index
    };

    const handleRemoveGuestFromSeat = () => {
        if (contextMenu.currentGuest) {
            onRemoveGuest(contextMenu.currentGuest.id);
        }
    };

    // Helper function to get first name and last initial
    const getFirstNameLastInitial = (name: string): string => {
        const parts = name.trim().split(" ");
        if (parts.length === 1) {
            return parts[0];
        }
        const firstName = parts[0];
        const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
        return `${firstName} ${lastInitial}`;
    };

    const [isOver, setIsOver] = useState(false);
    const [canDrop, setCanDrop] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();

        // We can't reliably read dataTransfer data during dragOver in some browsers
        // So we'll be permissive and let the drop handler figure out the details
        setIsOver(true);
        setCanDrop(true); // We'll validate on drop
    };

    const handleDragLeave = (e: React.DragEvent) => {
        // Only hide drop feedback if we're leaving the table container itself
        if (!ref.current?.contains(e.relatedTarget as Node)) {
            setIsOver(false);
            setCanDrop(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(false);
        setCanDrop(false);

        try {
            const data = e.dataTransfer.getData("application/json");
            if (data) {
                const item = JSON.parse(data);

                if (item.isMultiple && item.ids.length > 1) {
                    // Handle multiple guests respecting available seats
                    const available = table.seats - table.guests.length;
                    if (available > 0) {
                        const guestsToAssign = item.ids.slice(0, Math.min(item.ids.length, available));
                        guestsToAssign.forEach((guestId: string) => {
                            onAssignGuest(guestId, table.id);
                        });
                    }
                } else {
                    // Handle single guest - always allow assignment (will handle seat reassignment)
                    const guestId = item.ids?.[0] || item.primaryId;
                    if (guestId) {
                        onAssignGuest(guestId, table.id);
                    }
                }
            }
        } catch (error) {
            console.error("Error handling drop:", error);
        }
    };

    // Generate seat layout based on shape
    const layout = generateSeatLayout(table.shape || "oval", table.seats);
    const tableWidth = layout.width;
    const tableHeight = layout.height;
    const seatPositions = layout.positions;
    const seatDiameter = 48; // consistent across shapes
    const seatRadius = seatDiameter / 2;

    // Determine table status based on occupancy
    const getTableStatus = () => {
        const count = table.guests.length;
        const min = table.desiredMinSeats;
        const max = table.desiredMaxSeats;
        if (count === 0) {
            return {
                color: "bg-gray-100 border-gray-300",
                text: `${count}/${table.seats}`,
                badge: "secondary",
                badgeClass: "bg-gray-100 text-gray-600 border-gray-300",
            };
        }
        if (count < min) {
            return {
                color: "bg-yellow-50 border-yellow-400",
                text: `${count}/${table.seats}`,
                badge: "default",
                badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-300",
            };
        }
        if (count < max) {
            return {
                color: "bg-green-50 border-green-400",
                text: `${count}/${table.seats}`,
                badge: "default",
                badgeClass: "bg-green-100 text-green-800 border-green-300",
            };
        }
        if (count === max) {
            return {
                color: "bg-blue-50 border-blue-500",
                text: `${count}/${table.seats}`,
                badge: "default",
                badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
            };
        }
        // Above desired max (over capacity)
        return {
            color: "bg-red-50 border-red-400",
            text: `${count}/${table.seats}`,
            badge: "destructive",
            badgeClass: "bg-red-100 text-red-800 border-red-300",
        };
    };

    const tableStatus = getTableStatus();

    return (
        <>
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
            <div
                ref={ref}
                className={`absolute select-none transition-all ${
                    isDragging ? "opacity-50" : ""
                } ${isSelected ? "z-20" : "z-10"}`}
                style={{
                    left: table.x,
                    top: table.y,
                    transform: "translate(-50%, -50%)",
                }}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('[data-no-select="true"]')) return;
                    onSelect(isSelected ? null : table.id);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(isSelected ? null : table.id);
                    }
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* Table surface - oval shape */}
                <div
                    className={`table-surface relative border-3 transition-all ${
                        isOver && canDrop
                            ? "border-green-400 bg-green-100 shadow-lg scale-105"
                            : isOver && !canDrop
                                ? "border-red-400 bg-red-100"
                                : isSelected
                                    ? "border-blue-500 shadow-md"
                                    : tableStatus.color
                    } ${ (table.shape || "oval") === "rect" ? "rounded-lg" : "rounded-full"}`}
                    style={{
                        width: tableWidth,
                        height: tableHeight,
                    }}
                >
                    {/* Drag handle removed from inside; now rendered after seats for higher stacking */}
                    {/* Table name and info */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                        {isEditing ? (
                            <form
                                className="pointer-events-auto flex items-center gap-1 mb-1"
                                data-no-select="true"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleNameSave();
                                }}
                            >
                                <Input
                                    ref={inputRef}
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onBlur={handleNameSave}
                                    className="w-24 h-6 text-xs text-center px-1"
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    type="submit"
                                    className="w-4 h-4 p-0"
                                    data-no-select="true"
                                >
                                    <Check className="w-3 h-3" />
                                </Button>
                            </form>
                        ) : (
                            <div
                                className="pointer-events-auto flex items-center gap-1 mb-1 group"
                                role="group"
                                data-no-select="true"
                            >
                                <button
                                    type="button"
                                    className="font-medium text-sm focus:outline-none"
                                    onClick={(e) => handleNameEdit(e)}
                                    data-no-select="true"
                                >
                                    {table.name}
                                </button>
                                {isSelected && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="w-4 h-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e: React.MouseEvent) => handleNameEdit(e)}
                                        data-no-select="true"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Status badge */}
                        <Badge
                            className={`text-xs border ${
                                tableStatus.badgeClass ||
                            (tableStatus.badge === "secondary"
                                ? "bg-gray-100 text-gray-600 border-gray-300"
                                : tableStatus.badge === "destructive"
                                    ? "bg-red-100 text-red-800 border-red-300"
                                    : "")
                            }`}
                        >
                            {tableStatus.text}
                        </Badge>

                        {/* Drag feedback */}
                        {isOver && (
                            <Badge variant="default" className="text-xs mt-1 bg-green-600">
                            Drop here to assign
                            </Badge>
                        )}
                    </div>

                    {/* Info button moved to overlay control bar */}

                    {/* Central overlay controls (remove + drag) */}
                    {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="flex gap-2 pointer-events-auto bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="w-6 h-6 p-0"
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        setShowRemoveConfirm(true);
                                    }}
                                    title="Remove table"
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                                {table.guests.length > 0 && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-6 h-6 p-0"
                                        onClick={(e: React.MouseEvent) => {
                                            e.stopPropagation();
                                            setShowInfoDialog(true);
                                        }}
                                        title="View guests"
                                        aria-label="View table guests"
                                    >
                                        <Info className="w-3 h-3" />
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-6 h-6 p-0"
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        setShowConfigDialog(true);
                                    }}
                                    title="Edit configuration"
                                >
                                    <Edit2 className="w-3 h-3" />
                                </Button>
                                <div
                                    ref={dragHandleRef}
                                    draggable
                                    onDragStart={handleTableDragStart}
                                    onDragEnd={handleTableDragEnd}
                                    className="flex items-center gap-1 cursor-grab active:cursor-grabbing select-none text-[10px] font-medium px-2 h-6 rounded-full border bg-white shadow-sm"
                                    title="Drag to move"
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                        // no click action here other than editing; keep stopPropagation
                                        }
                                    }}
                                    aria-label="Drag table"
                                >
                                    <Move className="w-3 h-3" /> Move
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Seats */}
                {seatPositions.map((pos, index) => {
                    const guest = table.guests[index];

                    const handleSeatDragStart = (e: React.DragEvent) => {
                        if (guest) {
                            e.dataTransfer.setData(
                                "application/json",
                                JSON.stringify({
                                    type: "guest",
                                    ids: [guest.id],
                                    isMultiple: false,
                                    primaryId: guest.id,
                                })
                            );
                            e.dataTransfer.effectAllowed = "move";
                        }
                    };

                    return (
                        <button
                            key={index}
                            type="button"
                            className={`absolute w-12 h-12 rounded-full border flex items-center justify-center text-[10px] font-medium transition-all cursor-pointer hover:scale-110 z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                                guest
                                    ? "bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200 cursor-grab active:cursor-grabbing"
                                    : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
                            }`}
                            style={{
                                left: tableWidth / 2 + pos.x - seatRadius,
                                top: tableHeight / 2 + pos.y - seatRadius,
                            }}
                            title={guest ? guest.name : `Seat ${index + 1}`}
                            onClick={(e) => handleSeatClick(e, index)}
                            draggable={!!guest}
                            onDragStart={handleSeatDragStart}
                            aria-label={guest ? `${guest.name} seat ${index + 1}` : `Empty seat ${index + 1}`}
                        >
                            {guest ? (
                                <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold leading-tight px-1">
                                    <div className="text-center truncate max-w-full">
                                        {getFirstNameLastInitial(guest.name)}
                                    </div>
                                </div>
                            ) : (
                                <div>{index + 1}</div>
                            )}
                        </button>
                    );
                })}

                {/* Remove confirmation dialog (lightweight inline) */}
                {showRemoveConfirm && isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center z-50" role="alertdialog" aria-modal="true" aria-labelledby={`remove-table-${table.id}`}> 
                        <div className="bg-white border rounded-md shadow-md p-3 w-44 space-y-2">
                            <div id={`remove-table-${table.id}`} className="text-xs font-medium text-center">
                            Remove this table?
                            </div>
                            <div className="flex gap-2 justify-center">
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-6 text-xs"
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        onRemoveTable(table.id);
                                        setShowRemoveConfirm(false);
                                    }}
                                >
                                Remove
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 text-xs"
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        setShowRemoveConfirm(false);
                                    }}
                                >
                                Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {showConfigDialog && isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby={`config-table-${table.id}`}>
                        <div className="bg-white border rounded-md shadow-md p-4 w-72 space-y-3" data-no-select="true">
                            <div className="flex items-center justify-between">
                                <div id={`config-table-${table.id}`} className="text-xs font-semibold">Edit Table Config</div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="w-6 h-6 p-0"
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        setShowConfigDialog(false);
                                    }}
                                    aria-label="Close configuration dialog"
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-medium" htmlFor={`name-${table.id}`}>Name</label>
                                    <Input
                                        id={`name-${table.id}`}
                                        type="text"
                                        value={cfgName}
                                        onChange={(e) => setCfgName(e.target.value)}
                                        className="h-7 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-medium" htmlFor={`seats-${table.id}`}>Seats</label>
                                    <Input
                                        id={`seats-${table.id}`}
                                        type="number"
                                        min={table.guests.length}
                                        value={cfgSeats}
                                        onChange={(e) => setCfgSeats(Number(e.target.value) || 0)}
                                        className="h-7 text-xs"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[10px] font-medium" htmlFor={`min-${table.id}`}>Desired Min</label>
                                        <Input
                                            id={`min-${table.id}`}
                                            type="number"
                                            min={0}
                                            value={cfgMin}
                                            onChange={(e) => setCfgMin(Number(e.target.value) || 0)}
                                            className="h-7 text-xs"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[10px] font-medium" htmlFor={`max-${table.id}`}>Desired Max</label>
                                        <Input
                                            id={`max-${table.id}`}
                                            type="number"
                                            min={1}
                                            value={cfgMax}
                                            onChange={(e) => setCfgMax(Number(e.target.value) || 0)}
                                            className="h-7 text-xs"
                                        />
                                    </div>
                                </div>
                                {configValidation() && (
                                    <div className="text-[10px] text-red-600" role="alert">{configValidation()}</div>
                                )}
                            </div>
                            <div className="flex gap-2 justify-end pt-1">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        setShowConfigDialog(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-7 text-xs"
                                    disabled={!!configValidation()}
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        handleConfigSave();
                                    }}
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Seat Context Menu */}
                <SeatContextMenu
                    isOpen={contextMenu.isOpen}
                    position={contextMenu.position}
                    seatNumber={contextMenu.seatNumber}
                    currentGuest={contextMenu.currentGuest}
                    allGuests={allGuests}
                    allTables={allTables}
                    onClose={handleContextMenuClose}
                    onAssignGuest={handleAssignGuestToSeat}
                    onRemoveGuest={handleRemoveGuestFromSeat}
                    currentTableName={table.id}
                />

                {/* Table Info Dialog */}
                <TableInfoDialog
                    isOpen={showInfoDialog}
                    onClose={() => setShowInfoDialog(false)}
                    table={table}
                    onRemoveGuest={onRemoveGuest}
                    onReorderGuests={(ordered) => onReorderGuests(table.id, ordered)}
                />
            </div>
        </>
    );
}
