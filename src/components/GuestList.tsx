import React, { useState } from "react";
import { Guest } from "./TablePlanner";
import { GuestCard } from "./GuestCard";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Search, X, ChevronDown, ChevronRight } from "lucide-react";

interface GuestListProps {
    guests: Guest[];
    selectedGuests: Set<string>;
    onToggleSelection: (guestId: string, isShiftClick: boolean) => void;
    onClearSelection: () => void;
}

export function GuestList({
    guests,
    selectedGuests,
    onToggleSelection,
    onClearSelection,
}: GuestListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [isOpen, setIsOpen] = useState(true);

    const filteredGuests = guests.filter((guest) => {
        const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || guest.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = Array.from(
        new Set(guests.map((g) => g.category).filter(Boolean))
    ) as string[];

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex flex-col">
            <div className="border-b border-border">
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50"
                    >
                        <div className="flex items-center gap-2">
                            <h3>Unassigned Guests ({guests.length})</h3>
                            {selectedGuests.size > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                    {selectedGuests.size} selected
                                </Badge>
                            )}
                        </div>
                        {isOpen ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </Button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-2">
                        {selectedGuests.size > 0 && (
                            <div className="flex items-center justify-between">
                                <Badge variant="secondary">{selectedGuests.size} selected</Badge>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={onClearSelection}
                                    className="h-6 w-6 p-0"
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>
                        )}

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search guests..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>

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
                    </div>

                    <div className="px-4 pb-4 space-y-2">
                        {filteredGuests.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                {guests.length === 0 ? "All guests assigned!" : "No guests found"}
                            </div>
                        ) : (
                            filteredGuests.map((guest) => (
                                <GuestCard
                                    key={guest.id}
                                    guest={guest}
                                    isSelected={selectedGuests.has(guest.id)}
                                    selectedCount={selectedGuests.size}
                                    selectedGuestIds={Array.from(selectedGuests)}
                                    onToggleSelection={onToggleSelection}
                                />
                            ))
                        )}
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}
