import React, { useState, useRef, useEffect } from "react";
import { TableData, Guest } from "./TablePlanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { UsersIcon as Users, XIcon as X, GripVerticalIcon as GripVertical } from "./icons";

interface TableInfoDialogProps {
    isOpen: boolean;
    onClose: () => void;
    table: TableData;
    onRemoveGuest: (guestId: string) => void;
    onReorderGuests: (orderedGuestIds: string[]) => void;
}

export function TableInfoDialog({ isOpen, onClose, table, onRemoveGuest, onReorderGuests }: TableInfoDialogProps) {
    const [guestOrder, setGuestOrder] = useState<Guest[]>(table.guests);
    const [draggedGuest, setDraggedGuest] = useState<Guest | null>(null);
    const draggingRef = useRef(false);
    const pendingClearRef = useRef<number | null>(null);
    const dragOverIdRef = useRef<string | null>(null);

    // Sync local order when table changes (open or external assignment)
    useEffect(() => {
        setGuestOrder(table.guests);
    }, [table.guests]);

    const handleDragStart = (e: React.DragEvent, guest: Guest) => {
        setDraggedGuest(guest);
        draggingRef.current = true;
        if (pendingClearRef.current) {
            window.clearTimeout(pendingClearRef.current);
            pendingClearRef.current = null;
        }
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
    };

    const handleDragEnd = () => {
        // Defer clearing so Radix outside detection (pointerup/click) still sees drag active
        if (pendingClearRef.current) window.clearTimeout(pendingClearRef.current);
        pendingClearRef.current = window.setTimeout(() => {
            draggingRef.current = false;
            setDraggedGuest(null);
            pendingClearRef.current = null;
            dragOverIdRef.current = null;
            // Persist reorder if changed
            const currentIds = table.guests.map(g => g.id);
            const newIds = guestOrder.map(g => g.id);
            if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
                onReorderGuests(newIds);
            }
        }, 120);
    };

    const handleDragEnterItem = (e: React.DragEvent, overGuest: Guest) => {
        if (!draggingRef.current || !draggedGuest || draggedGuest.id === overGuest.id) return;
        e.preventDefault();
        if (dragOverIdRef.current === overGuest.id) return;
        dragOverIdRef.current = overGuest.id;
        setGuestOrder((prev) => {
            const fromIdx = prev.findIndex(g => g.id === draggedGuest.id);
            const toIdx = prev.findIndex(g => g.id === overGuest.id);
            if (fromIdx === -1 || toIdx === -1) return prev;
            if (fromIdx === toIdx) return prev;
            const next = [...prev];
            const [moved] = next.splice(fromIdx, 1);
            next.splice(toIdx, 0, moved);
            return next;
        });
    };

    const handleDragOverContainer = (e: React.DragEvent) => {
        if (draggingRef.current) {
            e.preventDefault();
        }
    };

    // Safety: if dialog closes externally, clear drag state
    useEffect(() => {
        if (!isOpen) {
            draggingRef.current = false;
            if (pendingClearRef.current) {
                window.clearTimeout(pendingClearRef.current);
                pendingClearRef.current = null;
            }
            setDraggedGuest(null);
        }
    }, [isOpen]);

    const handleOpenChange = (next: boolean) => {
        if (!next && draggingRef.current) return; // ignore close while dragging
        if (!next) onClose();
    };

    const getGuestCardCategory = (guest: Guest) => {
        switch (guest.category) {
            case "Family":
                return "bg-blue-100 text-blue-800 border-blue-300";
            case "Friends":
                return "bg-green-100 text-green-800 border-green-300";
            case "Colleagues":
                return "bg-purple-100 text-purple-800 border-purple-300";
            case "VIP":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange} aria-describedby={`table-${table.id}-desc`}>
            <DialogContent
                className="max-w-md"
                onPointerDownOutside={(e) => { if (draggingRef.current) e.preventDefault(); }}
                onInteractOutside={(e) => { if (draggingRef.current) e.preventDefault(); }}
                onEscapeKeyDown={(e) => { if (draggingRef.current) e.preventDefault(); }}
                // Capture native drag events to prevent bubbling to underlying tables
                onDragOverCapture={(e) => { if (draggingRef.current) { e.preventDefault(); e.stopPropagation(); }} }
                onDragEnterCapture={(e) => { if (draggingRef.current) { e.preventDefault(); e.stopPropagation(); }} }
                onDragLeaveCapture={(e) => { if (draggingRef.current) { e.stopPropagation(); }} }
                onDropCapture={(e) => { if (draggingRef.current) { e.preventDefault(); e.stopPropagation(); }} }
            >
                <DialogHeader className="pr-8">
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        {table.name}
                    </DialogTitle>
                    <p id={`table-${table.id}-desc`} className="sr-only">
                        Guest list for {table.name}. Drag to reorder inside dialog or drag out to another table. Dialog should remain open during drag.
                    </p>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 w-7 h-7 p-0 opacity-70 hover:opacity-100"
                        aria-label="Close"
                        onClick={() => onClose()}
                        disabled={draggingRef.current}
                        title={draggingRef.current ? "Finish drag to close" : "Close"}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </DialogHeader>

                <div className="space-y-4 flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            {table.guests.length} of 12 seats occupied
                        </span>
                        <Badge
                            className={`text-xs border ${
                                table.guests.length === 0
                                    ? "bg-gray-100 text-gray-600 border-gray-300"
                                    : table.guests.length < 8
                                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                        : table.guests.length <= 12
                                            ? "bg-green-100 text-green-800 border-green-300"
                                            : "bg-red-100 text-red-800 border-red-300"
                            }`}
                        >
                            {table.guests.length}/12
                        </Badge>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="space-y-2 pr-2" onDragOver={handleDragOverContainer}>
                            {guestOrder.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No guests assigned to this table</p>
                                </div>
                            ) : (
                                guestOrder.map((guest, index) => (
                                    <Card
                                        key={guest.id}
                                        className={`p-3 cursor-grab hover:shadow-md transition-all ${
                                            draggedGuest?.id === guest.id
                                                ? "opacity-50 scale-95"
                                                : ""
                                        }`}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, guest)}
                                        onDragEnd={handleDragEnd}
                                        onDragEnter={(e) => handleDragEnterItem(e, guest)}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 flex-1">
                                                <GripVertical className="w-4 h-4 text-muted-foreground" />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-medium">
                                                            {guest.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            Seat {index + 1}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {guest.category && (
                                                            <Badge
                                                                className={`text-xs border ${getGuestCardCategory(guest)}`}
                                                            >
                                                                {guest.category}
                                                            </Badge>
                                                        )}
                                                        {guest.dietary && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {guest.dietary}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                title="Remove guest from table"
                                                aria-label={`Remove ${guest.name} from table`}
                                                className="w-7 h-7 p-0 text-muted-foreground hover:text-red-700 hover:bg-red-100 rounded-full"
                                                onClick={(e: React.MouseEvent) => {
                                                    e.stopPropagation();
                                                    onRemoveGuest(guest.id);
                                                }}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                    <div className="text-xs text-muted-foreground pt-1" id="table-info-dialog-description">
                        <p>
                            💡 <strong>Tip:</strong> Drag guest cards to other tables to reassign
                            them
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
