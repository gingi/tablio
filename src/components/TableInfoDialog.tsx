import React, { useState } from "react";
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
}

export function TableInfoDialog({ isOpen, onClose, table, onRemoveGuest }: TableInfoDialogProps) {
    const [draggedGuest, setDraggedGuest] = useState<Guest | null>(null);

    const handleDragStart = (e: React.DragEvent, guest: Guest) => {
        setDraggedGuest(guest);
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
        setDraggedGuest(null);
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
        <Dialog open={isOpen} onOpenChange={onClose} aria-describedby="table-info-dialog-description">
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        {table.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 flex-1 flex flex-col min-h-0" aria-describedby={`table-${table.id}-desc`}>
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
                        <div className="space-y-2 pr-2">
                            {table.guests.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No guests assigned to this table</p>
                                </div>
                            ) : (
                                table.guests.map((guest, index) => (
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
