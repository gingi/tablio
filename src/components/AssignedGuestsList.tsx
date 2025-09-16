import React, { useState } from "react";
import { Guest, TableData } from "./TablePlanner";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
// import { ScrollArea } from './ui/scroll-area'; // Removed unused import
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { SearchIcon as Search, GripVerticalIcon as GripVertical, ChevronDownIcon as ChevronDown, ChevronRightIcon as ChevronRight } from "./icons";

interface AssignedGuestsListProps {
    guests: Guest[];
    tables: TableData[];
    defaultOpen?: boolean;
}

export function AssignedGuestsList({ guests, tables, defaultOpen = false }: AssignedGuestsListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const filteredGuests = guests.filter((guest) => {
        const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || guest.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = Array.from(
        new Set(guests.map((g) => g.category).filter(Boolean))
    ) as string[];

    const getTableName = (tableId?: string): string => {
        if (!tableId) return "Unassigned";
        const table = tables.find((t) => t.id === tableId);
        return table?.name || "Unknown Table";
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

    const handleDragStart = (e: React.DragEvent, guest: Guest) => {
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

    if (guests.length === 0) {
        return null;
    }

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="border-b border-border">
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50"
                    >
                        <h3>Assigned Guests ({guests.length})</h3>
                        {isOpen ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="collapsible-anim">
                    <div className="px-4 pb-4 space-y-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search assigned guests..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                                aria-label="Search assigned guests"
                            />
                        </div>

                        {categories.length > 0 && (
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger>
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

                    <div className="px-4 pb-4 space-y-2">
                        {filteredGuests.length === 0 ? (
                            <div className="text-center text-muted-foreground py-4">
                                No assigned guests found
                            </div>
                        ) : (
                            filteredGuests.map((guest) => (
                                <Card
                                    key={guest.id}
                                    className="p-3 cursor-grab hover:shadow-md transition-all active:cursor-grabbing card-fade-in"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, guest)}
                                >
                                    <div className="flex items-center gap-2">
                                        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium truncate">
                                                    {guest.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {guest.category && (
                                                    <Badge
                                                        className={`text-xs border ${getGuestCardCategory(guest)}`}
                                                    >
                                                        {guest.category}
                                                    </Badge>
                                                )}
                                                <Badge variant="outline" className="text-xs">
                                                    {getTableName(guest.tableId)}
                                                </Badge>
                                                {guest.dietary && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {guest.dietary}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}
