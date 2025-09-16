import React, { useState } from "react";
import { Guest } from "./TablePlanner";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { GripVerticalIcon as GripVertical } from "./icons";

interface GuestCardProps {
    guest: Guest;
    isSelected: boolean;
    selectedCount: number;
    selectedGuestIds: string[];
    onToggleSelection: (guestId: string, isShiftClick: boolean) => void;
}

export function GuestCard({
    guest,
    isSelected,
    selectedCount,
    selectedGuestIds,
    onToggleSelection,
}: GuestCardProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (e: React.DragEvent) => {
        setIsDragging(true);

        // If this guest is selected and there are multiple guests selected, drag all selected
        if (isSelected && selectedCount > 1) {
            e.dataTransfer.setData(
                "application/json",
                JSON.stringify({
                    type: "guest",
                    ids: selectedGuestIds,
                    isMultiple: true,
                    primaryId: guest.id,
                })
            );
        } else {
            // Otherwise just drag this guest
            e.dataTransfer.setData(
                "application/json",
                JSON.stringify({
                    type: "guest",
                    ids: [guest.id],
                    isMultiple: false,
                    primaryId: guest.id,
                })
            );
        }

        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        onToggleSelection(guest.id, e.shiftKey);
    };

    return (
        <Card
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={handleClick}
            className={`p-3 cursor-grab active:cursor-grabbing transition-all select-none border-l-4 ${
                isSelected
                    ? "bg-blue-100 border-l-blue-500 shadow-md"
                    : "border-l-transparent hover:border-l-blue-400 hover:shadow-lg hover:bg-blue-50"
            } ${isDragging ? "opacity-30 transform rotate-3 scale-105 shadow-2xl" : ""}`}
        >
            <div className="flex items-center gap-3">
                <div className="flex items-center">
                    <GripVertical className="w-4 h-4 text-muted-foreground mr-2" />
                    <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {guest.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{guest.name}</div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                        {guest.category && (
                            <Badge variant="secondary" className="text-xs">
                                {guest.category}
                            </Badge>
                        )}
                        {guest.dietary && (
                            <Badge variant="outline" className="text-xs">
                                {guest.dietary}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
