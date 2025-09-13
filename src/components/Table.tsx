import React, { useRef, useState, useEffect } from "react";
import { TableData, Guest } from "./TablePlanner";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { SeatContextMenu } from "./SeatContextMenu";
import { TableInfoDialog } from "./TableInfoDialog";
import { X, Move, Edit2, Check, Info } from "lucide-react";

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

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleNameEdit = () => {
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
        e.stopPropagation();
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
                    // Handle multiple guests
                    const guestsToAssign = item.ids.slice(0, Math.min(item.ids.length, 12));
                    guestsToAssign.forEach((guestId: string) => {
                        onAssignGuest(guestId, table.id);
                    });
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

    // Oval table dimensions - always 12 seats (made much larger)
    const tableWidth = 240;
    const tableHeight = 160;
    const seatPositions = Array.from({ length: 12 }, (_, i) => {
        // Distribute seats around oval perimeter
        const t = (i / 12) * 2 * Math.PI;
        return {
            x: Math.cos(t) * (tableWidth / 2),
            y: Math.sin(t) * (tableHeight / 2),
        };
    });

    // Determine table status based on occupancy
    const getTableStatus = () => {
        const count = table.guests.length;
        // Empty
        if (count === 0)
            return {
                color: "bg-gray-100 border-gray-300",
                text: `${count}/12`,
                badge: "secondary",
                badgeClass: "bg-gray-100 text-gray-600 border-gray-300",
            };
        // Partial - low occupancy
        if (count < 8)
            return {
                color: "bg-yellow-50 border-yellow-400",
                text: `${count}/12`,
                badge: "default",
                badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-300",
            };
        // Full capacity exactly -> BLUE styling as requested
        if (count === 12)
            return {
                color: "bg-blue-50 border-blue-500",
                text: `${count}/12`,
                badge: "default",
                badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
            };
        // Medium/high but not yet full
        if (count < 12)
            return {
                color: "bg-green-50 border-green-400",
                text: `${count}/12`,
                badge: "default",
                badgeClass: "bg-green-100 text-green-800 border-green-300",
            };
        // Over-capacity (should not normally happen)
        return {
            color: "bg-red-50 border-red-400",
            text: `${count}/12`,
            badge: "destructive",
            badgeClass: "bg-red-100 text-red-800 border-red-300",
        };
    };

    const tableStatus = getTableStatus();

    return (
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
            onClick={() => onSelect(isSelected ? null : table.id)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Table surface - oval shape */}
            <div
                className={`table-surface relative rounded-full border-3 transition-all ${
                    isOver && canDrop
                        ? "border-green-400 bg-green-100 shadow-lg scale-105"
                        : isOver && !canDrop
                            ? "border-red-400 bg-red-100"
                            : isSelected
                                ? "border-blue-500 shadow-md"
                                : tableStatus.color
                }`}
                style={{
                    width: tableWidth,
                    height: tableHeight,
                }}
            >
                {/* Table name and info */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    {isEditing ? (
                        <div className="pointer-events-auto flex items-center gap-1 mb-1">
                            <Input
                                ref={inputRef}
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleNameSave}
                                className="w-20 h-6 text-xs text-center px-1"
                            />
                            <Button
                                size="sm"
                                variant="ghost"
                                className="w-4 h-4 p-0"
                                onClick={handleNameSave}
                            >
                                <Check className="w-3 h-3" />
                            </Button>
                        </div>
                    ) : (
                        <div className="pointer-events-auto flex items-center gap-1 mb-1 group">
                            <div className="font-medium text-sm">{table.name}</div>
                            {isSelected && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="w-4 h-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        handleNameEdit();
                                    }}
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

                {/* Info button */}
                {table.guests.length > 0 && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="absolute -top-2 -right-12 w-6 h-6 rounded-full p-0 pointer-events-auto bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300"
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            setShowInfoDialog(true);
                        }}
                        title="View table guests"
                    >
                        <Info className="w-3 h-3 text-blue-600" />
                    </Button>
                )}

                {/* Remove button */}
                {isSelected && (
                    <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 pointer-events-auto"
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            onRemoveTable(table.id);
                        }}
                    >
                        <X className="w-3 h-3" />
                    </Button>
                )}

                {/* Drag handle */}
                {isSelected && (
                    <div
                        ref={dragHandleRef}
                        draggable
                        onDragStart={handleTableDragStart}
                        onDragEnd={handleTableDragEnd}
                        className="absolute -top-8 left-1/2 transform -translate-x-1/2 pointer-events-auto cursor-grab active:cursor-grabbing"
                    >
                        <Badge
                            variant="outline"
                            className="bg-white hover:bg-gray-50 transition-colors"
                        >
                            <Move className="w-3 h-3 mr-1" />
                            Drag to move
                        </Badge>
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
                    <div
                        key={index}
                        className={`absolute w-12 h-12 rounded-full border-2 flex items-center justify-center text-xs transition-all cursor-pointer hover:scale-110 ${
                            guest
                                ? "bg-blue-100 border-blue-400 text-blue-800 hover:bg-blue-200 cursor-grab active:cursor-grabbing"
                                : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
                        }`}
                        style={{
                            left: tableWidth / 2 + pos.x - 24,
                            top: tableHeight / 2 + pos.y - 24,
                        }}
                        title={guest ? guest.name : `Seat ${index + 1}`}
                        onClick={(e) => handleSeatClick(e, index)}
                        draggable={!!guest}
                        onDragStart={handleSeatDragStart}
                    >
                        {guest ? (
                            <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-[10px] leading-tight px-1">
                                <div className="text-center truncate max-w-full">
                                    {getFirstNameLastInitial(guest.name)}
                                </div>
                            </div>
                        ) : (
                            <div className="font-medium">{index + 1}</div>
                        )}
                    </div>
                );
            })}

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
            />
        </div>
    );
}
