import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Guest, TableData } from "./TablePlanner";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { X, User, UserX, Search } from "lucide-react";

interface SeatContextMenuProps {
    isOpen: boolean;
    position: { x: number; y: number };
    seatNumber: number;
    currentGuest?: Guest;
    allGuests: Guest[];
    allTables: TableData[]; // Provide table info for labels
    onClose: () => void;
    onAssignGuest: (guestId: string, seatNumber: number) => void;
    onRemoveGuest: () => void;
    currentTableName: string;
}

export function SeatContextMenu({
    isOpen,
    position,
    seatNumber,
    currentGuest,
    allGuests,
    allTables,
    onClose,
    onAssignGuest,
    onRemoveGuest,
    currentTableName,
}: SeatContextMenuProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    // Reset search when menu opens
    useEffect(() => {
        if (isOpen) {
            setSearchTerm("");
            setCategoryFilter("all");
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            return () => document.removeEventListener("keydown", handleKeyDown);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getGuestTableName = (guest: Guest): string => {
        if (!guest.tableId) return "Unassigned";
        const table = allTables.find((t) => t.id === guest.tableId);
        if (!table) return "Unknown table";
        return table.id === currentTableName ? "This table" : table.name;
    };

    // Filter guests based on search term and category
    const filteredGuests = allGuests.filter((guest) => {
        const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || guest.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Get unique categories for filter dropdown
    const categories = Array.from(
        new Set(allGuests.map((g) => g.category).filter(Boolean))
    ) as string[];

    const handleClickOutside = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Use a portal so z-index is not constrained by table container (which has transform)
    const portalContent = (
        <div
            className="fixed inset-0 z-[100] bg-black/20"
            onClick={handleClickOutside}
            role="dialog"
            aria-modal="true"
        >
            <Card
                className="absolute bg-white shadow-xl border w-80"
                style={{
                    left: Math.max(
                        10,
                        Math.min(position.x - 160, Math.max(window.innerWidth - 330, 10))
                    ),
                    top: Math.max(
                        10,
                        Math.min(position.y - 100, Math.max(window.innerHeight - 500, 10))
                    ),
                }}
            >
                <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">Seat {seatNumber}</h3>
                        <Button size="sm" variant="ghost" className="w-6 h-6 p-0" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {currentGuest && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-sm">{currentGuest.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                        Currently assigned
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-7"
                                    onClick={() => {
                                        onRemoveGuest();
                                        onClose();
                                    }}
                                >
                                    <UserX className="w-3 h-3 mr-1" />
                                    Remove
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="mb-2">
                        <div className="text-sm font-medium mb-3">Assign Guest:</div>

                        {/* Search controls */}
                        <div className="space-y-2 mb-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search guests..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 h-8"
                                />
                            </div>

                            {categories.length > 0 && (
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Filter by category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <ScrollArea className="h-52">
                            <div className="space-y-1">
                                {filteredGuests.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-4 text-sm">
                                        {searchTerm || categoryFilter !== "all"
                                            ? "No guests found"
                                            : "No guests available"}
                                    </div>
                                ) : (
                                    filteredGuests.map((guest) => (
                                        <div
                                            key={guest.id}
                                            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                                                guest.id === currentGuest?.id
                                                    ? "bg-blue-100 border-blue-300"
                                                    : "hover:bg-gray-50 border-transparent"
                                            }`}
                                            onClick={() => {
                                                if (guest.id !== currentGuest?.id) {
                                                    onAssignGuest(guest.id, seatNumber);
                                                    onClose();
                                                }
                                            }}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium truncate">
                                                    {guest.name}
                                                </div>
                                                <div className="flex gap-1 mt-1 flex-wrap">
                                                    {guest.category && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {guest.category}
                                                        </Badge>
                                                    )}
                                                    <Badge
                                                        variant={
                                                            guest.tableId ? "default" : "outline"
                                                        }
                                                        className="text-xs"
                                                    >
                                                        {getGuestTableName(guest)}
                                                    </Badge>
                                                </div>
                                            </div>
                                            {guest.id === currentGuest?.id && (
                                                <User className="w-4 h-4 text-blue-600 ml-2" />
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </Card>
        </div>
    );

    if (typeof document !== "undefined") {
        return createPortal(portalContent, document.body);
    }
    return portalContent;
}
