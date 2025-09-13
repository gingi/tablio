import React, { useState, useCallback, useRef, useEffect } from "react";
import { Table } from "./Table";
import { GuestList } from "./GuestList";
import { AssignedGuestsList } from "./AssignedGuestsList";
import { GuestForm } from "./GuestForm";
import { Controls } from "./Controls";
import { Summary } from "./Summary";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { toast } from "sonner@2.0.3";
import { Toaster } from "./ui/sonner";
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";

export interface Guest {
    id: string;
    name: string;
    category?: string;
    dietary?: string;
    tableId?: string;
    seatNumber?: number;
}

export interface TableData {
    id: string;
    name: string;
    seats: number;
    x: number;
    y: number;
    guests: Guest[];
}

const SAMPLE_NAMES = [
    "Alice Johnson",
    "Bob Smith",
    "Carol Davis",
    "David Wilson",
    "Emma Brown",
    "Frank Miller",
    "Grace Lee",
    "Henry Taylor",
    "Isabella Garcia",
    "Jack Anderson",
    "Katherine Martinez",
    "Liam Rodriguez",
    "Mia Hernandez",
    "Noah Lopez",
    "Olivia Gonzalez",
    "Parker Wilson",
    "Quinn Perez",
    "Rachel Moore",
    "Samuel Taylor",
    "Taylor Thomas",
    "Uma Jackson",
    "Victor White",
    "Wendy Harris",
    "Xavier Martin",
    "Yara Thompson",
    "Zachary Garcia",
    "Ava Clark",
    "Benjamin Lewis",
    "Charlotte Robinson",
    "Daniel Walker",
    "Emily Hall",
    "Felix Young",
    "Gabriela Allen",
    "Harrison King",
    "Iris Wright",
    "Julian Scott",
    "Kaitlyn Green",
    "Lucas Adams",
    "Madison Baker",
    "Nathan Nelson",
    "Ophelia Carter",
    "Preston Mitchell",
    "Quincy Perez",
    "Ruby Roberts",
    "Sebastian Turner",
    "Tessa Phillips",
    "Ulysses Campbell",
    "Violet Parker",
    "William Evans",
    "Xiomara Edwards",
    "Yasmin Collins",
];

const INITIAL_GUESTS: Guest[] = Array.from({ length: 50 }, (_, i) => ({
    id: `guest-${i + 1}`,
    name: SAMPLE_NAMES[i],
    category: ["Family", "Friends", "Colleagues", "VIP"][Math.floor(Math.random() * 4)],
    dietary:
        Math.random() > 0.8
            ? ["Vegetarian", "Vegan", "Gluten-Free"][Math.floor(Math.random() * 3)]
            : undefined,
}));

const INITIAL_TABLES: TableData[] = [
    { id: "table-1", name: "Head Table", seats: 12, x: 500, y: 200, guests: [] },
    { id: "table-2", name: "Family Table", seats: 12, x: 200, y: 400, guests: [] },
    { id: "table-3", name: "Friends Table", seats: 12, x: 800, y: 400, guests: [] },
];

// App state interface for localStorage
interface AppState {
    guests: Guest[];
    tables: TableData[];
    timestamp: number;
}

// History state for undo functionality
interface HistoryState {
    guests: Guest[];
    tables: TableData[];
    action: string;
}

const STORAGE_KEY = "table-planner-state";
const HISTORY_KEY = "table-planner-history";
const MAX_HISTORY = 20;
const AUTOSAVE_INTERVAL = 30000; // 30 seconds

export function TablePlanner() {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [tables, setTables] = useState<TableData[]>([]);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [history, setHistory] = useState<HistoryState[]>([]);
    const [guestCounter, setGuestCounter] = useState(0);
    const [zoom, setZoom] = useState(1);

    // Load state from localStorage on mount
    useEffect(() => {
        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            const savedHistory = localStorage.getItem(HISTORY_KEY);

            if (savedState) {
                const parsed: AppState = JSON.parse(savedState);
                setGuests(parsed.guests);
                setTables(parsed.tables);

                // Find the highest guest ID number to continue numbering
                const maxGuestId = parsed.guests.reduce((max, guest) => {
                    const match = guest.id.match(/guest-(\d+)/);
                    if (match) {
                        return Math.max(max, parseInt(match[1]));
                    }
                    return max;
                }, 0);
                setGuestCounter(maxGuestId);

                toast.success("Saved session restored");
            } else {
                // Use initial data if no saved state
                setGuests(INITIAL_GUESTS);
                setTables(INITIAL_TABLES);
                setGuestCounter(INITIAL_GUESTS.length);
            }

            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (error) {
            console.error("Error loading saved state:", error);
            setGuests(INITIAL_GUESTS);
            setTables(INITIAL_TABLES);
            setGuestCounter(INITIAL_GUESTS.length);
            toast.error("Failed to restore saved session, using defaults");
        }
    }, []);

    // Auto-save to localStorage
    useEffect(() => {
        const saveState = () => {
            try {
                const state: AppState = {
                    guests,
                    tables,
                    timestamp: Date.now(),
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            } catch (error) {
                console.error("Error saving state:", error);
            }
        };

        const interval = setInterval(saveState, AUTOSAVE_INTERVAL);
        return () => clearInterval(interval);
    }, [guests, tables]);

    // Save history to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        } catch (error) {
            console.error("Error saving history:", error);
        }
    }, [history]);

    // Add state to history
    const addToHistory = useCallback(
        (action: string, prevGuests: Guest[], prevTables: TableData[]) => {
            setHistory((prev) => {
                const newHistory = [...prev, { guests: prevGuests, tables: prevTables, action }];
                return newHistory.slice(-MAX_HISTORY); // Keep only last MAX_HISTORY items
            });
        },
        []
    );

    // Undo last action
    const undo = useCallback(() => {
        if (history.length === 0) {
            toast.error("Nothing to undo");
            return;
        }

        const lastState = history[history.length - 1];
        setGuests(lastState.guests);
        setTables(lastState.tables);
        setHistory((prev) => prev.slice(0, -1));
        toast.success(`Undid: ${lastState.action}`);
    }, [history]);

    // Add new guest
    const addGuest = useCallback(
        (name: string, category?: string, dietary?: string, tableId?: string) => {
            if (!name.trim()) {
                toast.error("Guest name cannot be empty");
                return;
            }

            // Check for duplicate names
            if (guests.some((g) => g.name.toLowerCase() === name.trim().toLowerCase())) {
                toast.error("A guest with this name already exists");
                return;
            }

            // If a table is specified, check if it has space
            if (tableId) {
                const table = tables.find((t) => t.id === tableId);
                if (table && table.guests.length >= 12) {
                    toast.error(`${table.name} is full`);
                    return;
                }
            }

            addToHistory("Add guest", guests, tables);

            const newGuest: Guest = {
                id: `guest-${guestCounter + 1}`,
                name: name.trim(),
                category,
                dietary,
                tableId,
            };

            setGuests((prev) => [...prev, newGuest]);
            setGuestCounter((prev) => prev + 1);

            // If a table is assigned, also add to the table's guest list
            if (tableId) {
                setTables((prev) =>
                    prev.map((table) => {
                        if (table.id === tableId) {
                            const occupiedSeats = new Set(
                                table.guests.map((g) => g.seatNumber).filter((s) => s !== undefined)
                            );
                            let nextAvailableSeat = 0;
                            while (occupiedSeats.has(nextAvailableSeat) && nextAvailableSeat < 12) {
                                nextAvailableSeat++;
                            }

                            const guestWithSeat = { ...newGuest, seatNumber: nextAvailableSeat };
                            return {
                                ...table,
                                guests: [...table.guests, guestWithSeat].sort(
                                    (a, b) => (a.seatNumber || 0) - (b.seatNumber || 0)
                                ),
                            };
                        }
                        return table;
                    })
                );

                const tableName = tables.find((t) => t.id === tableId)?.name || "table";
                toast.success(`Added ${name} to ${tableName}`);
            } else {
                toast.success(`Added ${name} to guest list`);
            }
        },
        [guests, tables, guestCounter, addToHistory]
    );

    // Remove guest
    const _removeGuest = useCallback(
        (guestId: string) => {
            const guest = guests.find((g) => g.id === guestId);
            if (!guest) return;

            addToHistory("Remove guest", guests, tables);

            // Remove from guests list
            setGuests((prev) => prev.filter((g) => g.id !== guestId));

            // Remove from tables
            setTables((prev) =>
                prev.map((table) => ({
                    ...table,
                    guests: table.guests.filter((g) => g.id !== guestId),
                }))
            );

            toast.success(`Removed ${guest.name} from guest list`);
        },
        [guests, tables, addToHistory]
    );

    // Reset all seat assignments
    const resetAllAssignments = useCallback(() => {
        addToHistory("Reset all assignments", guests, tables);

        setGuests((prev) => prev.map((g) => ({ ...g, tableId: undefined, seatNumber: undefined })));
        setTables((prev) => prev.map((t) => ({ ...t, guests: [] })));
        setSelectedGuests(new Set());

        toast.success("All seat assignments have been reset");
    }, [guests, tables, addToHistory]);

    // Internal assignment function without history tracking
    const assignGuestToTableInternal = useCallback(
        (guestId: string, tableId: string, seatNumber?: number) => {
            const guest = guests.find((g) => g.id === guestId);
            if (!guest) return;

            // First, find any guest that might be displaced from the target seat
            let displacedGuest: Guest | null = null;
            if (seatNumber !== undefined) {
                const targetTable = tables.find((t) => t.id === tableId);
                if (targetTable) {
                    displacedGuest =
                        targetTable.guests.find((g) => g.seatNumber === seatNumber) || null;
                }
            }

            // Show notification if displacing a guest
            if (displacedGuest && displacedGuest.id !== guestId) {
                const targetTable = tables.find((t) => t.id === tableId);
                toast.info(`${displacedGuest.name} was moved to unassigned guests`, {
                    description: `${guest.name} took their seat at ${targetTable?.name || "the table"}`,
                });
            }

            // Update guest records
            setGuests((prev) =>
                prev.map((g) => {
                    if (g.id === guestId) {
                        return { ...g, tableId, seatNumber: seatNumber ?? g.seatNumber };
                    }
                    // If a guest is being displaced, unassign them
                    if (displacedGuest && g.id === displacedGuest.id && g.id !== guestId) {
                        return { ...g, tableId: undefined, seatNumber: undefined };
                    }
                    return g;
                })
            );

            setTables((prev) =>
                prev.map((table) => {
                    if (table.id === tableId) {
                        // Remove the guest being moved if they're already in this table
                        let updatedGuests = table.guests.filter((g) => g.id !== guestId);

                        if (seatNumber !== undefined) {
                            // Remove any guest currently at the target seat
                            updatedGuests = updatedGuests.filter(
                                (g) => g.seatNumber !== seatNumber
                            );

                            // Add the new guest at the specified seat
                            updatedGuests.push({ ...guest, tableId, seatNumber });

                            // Sort by seat number to maintain order
                            updatedGuests.sort((a, b) => (a.seatNumber || 0) - (b.seatNumber || 0));
                        } else {
                            // General assignment - add to next available seat
                            const occupiedSeats = new Set(
                                updatedGuests
                                    .map((g) => g.seatNumber)
                                    .filter((s) => s !== undefined)
                            );
                            let nextAvailableSeat = 0;
                            while (occupiedSeats.has(nextAvailableSeat) && nextAvailableSeat < 12) {
                                nextAvailableSeat++;
                            }

                            if (nextAvailableSeat < 12) {
                                updatedGuests.push({
                                    ...guest,
                                    tableId,
                                    seatNumber: nextAvailableSeat,
                                });
                                updatedGuests.sort(
                                    (a, b) => (a.seatNumber || 0) - (b.seatNumber || 0)
                                );
                            }
                        }

                        return {
                            ...table,
                            guests: updatedGuests,
                        };
                    } else {
                        // Remove guest from other tables (but keep displaced guest if different table)
                        return {
                            ...table,
                            guests: table.guests.filter((g) => g.id !== guestId),
                        };
                    }
                })
            );
        },
        [guests, tables]
    );

    // Public assignment function with history tracking
    const assignGuestToTable = useCallback(
        (guestId: string, tableId: string, seatNumber?: number) => {
            addToHistory("Assign guest", guests, tables);
            assignGuestToTableInternal(guestId, tableId, seatNumber);
        },
        [guests, tables, addToHistory, assignGuestToTableInternal]
    );

    const _assignMultipleGuestsToTable = useCallback(
        (guestIds: string[], tableId: string) => {
            const table = tables.find((t) => t.id === tableId);
            if (!table) return;

            const availableSeats = 12 - table.guests.length;
            const guestsToAssign = guestIds.slice(0, availableSeats);

            if (guestsToAssign.length > 0) {
                addToHistory("Assign multiple guests", guests, tables);
                guestsToAssign.forEach((guestId) => {
                    assignGuestToTableInternal(guestId, tableId);
                });
            }
            setSelectedGuests(new Set());
        },
        [tables, assignGuestToTableInternal, guests, addToHistory]
    );

    // Internal remove function without history tracking
    const removeGuestFromTableInternal = useCallback((guestId: string) => {
        setGuests((prev) =>
            prev.map((guest) =>
                guest.id === guestId
                    ? { ...guest, tableId: undefined, seatNumber: undefined }
                    : guest
            )
        );

        setTables((prev) =>
            prev.map((table) => ({
                ...table,
                guests: table.guests.filter((g) => g.id !== guestId),
            }))
        );
    }, []);

    // Public remove function with history tracking
    const removeGuestFromTable = useCallback(
        (guestId: string) => {
            addToHistory("Remove guest from table", guests, tables);
            removeGuestFromTableInternal(guestId);
        },
        [guests, tables, addToHistory, removeGuestFromTableInternal]
    );

    const addTable = useCallback(
        (_seats: number) => {
            addToHistory("Add table", guests, tables);
            const count = tables.length;
            const newTable: TableData = {
                id: `table-${Date.now()}`,
                name: `Table ${count + 1}`,
                seats: 12,
                x: 200 + (count % 4) * 250,
                y: 150 + Math.floor(count / 4) * 250,
                guests: [],
            };
            setTables((prev) => [...prev, newTable]);
        },
        [tables, guests, addToHistory]
    );

    const removeTable = useCallback(
        (tableId: string) => {
            const table = tables.find((t) => t.id === tableId);
            if (table) {
                addToHistory("Remove table", guests, tables);

                // Remove all guests from this table
                table.guests.forEach((guest) => removeGuestFromTableInternal(guest.id));
                setTables((prev) => prev.filter((t) => t.id !== tableId));
            }
        },
        [tables, removeGuestFromTableInternal, guests, addToHistory]
    );

    const moveTable = useCallback((tableId: string, x: number, y: number) => {
        setTables((prev) =>
            prev.map((table) => (table.id === tableId ? { ...table, x, y } : table))
        );
    }, []);

    const renameTable = useCallback(
        (tableId: string, newName: string) => {
            addToHistory("Rename table", guests, tables);

            setTables((prev) =>
                prev.map((table) => (table.id === tableId ? { ...table, name: newName } : table))
            );
        },
        [guests, tables, addToHistory]
    );

    const importGuests = useCallback(
        (newGuests: Guest[]) => {
            addToHistory("Import guests", guests, tables);

            // Remove any existing sample guests and add imported guests
            setGuests((prev) => {
                const _existingImported = prev.filter((g) => g.id.startsWith("imported-"));
                const nonSample = prev.filter(
                    (g) => !g.id.startsWith("guest-") && !g.id.startsWith("imported-")
                );
                return [...nonSample, ...newGuests];
            });
        },
        [guests, tables, addToHistory]
    );

    const importLayout = useCallback(
        (data: { guests: Guest[]; tables: TableData[] }) => {
            addToHistory("Import layout", guests, tables);

            setGuests(data.guests);
            setTables(data.tables);
            setSelectedTable(null);
            setSelectedGuests(new Set());
        },
        [guests, tables, addToHistory]
    );

    const toggleGuestSelection = useCallback((guestId: string, isShiftClick: boolean) => {
        setSelectedGuests((prev) => {
            const newSelection = new Set(prev);

            if (isShiftClick) {
                // If shift-clicking, add to selection
                if (newSelection.has(guestId)) {
                    newSelection.delete(guestId);
                } else {
                    newSelection.add(guestId);
                }
            } else {
                // Regular click - toggle single selection
                if (newSelection.has(guestId) && newSelection.size === 1) {
                    newSelection.clear();
                } else {
                    newSelection.clear();
                    newSelection.add(guestId);
                }
            }

            return newSelection;
        });
    }, []);

    const clearGuestSelection = useCallback(() => {
        setSelectedGuests(new Set());
    }, []);

    const autoLayoutTables = useCallback(() => {
        if (tables.length === 0) return;

        const tableWidth = 320;
        const tableHeight = 240;
        const minX = 200;
        const minY = 150;

        let cols: number;
        if (tables.length <= 3) {
            cols = Math.min(tables.length, 3);
        } else if (tables.length <= 9) {
            // 4-9 tables → 3 columns
            cols = 3;
        } else {
            cols = Math.ceil(Math.sqrt(tables.length));
        }

        setTables((prev) =>
            prev.map((table, index) => {
                const col = index % cols;
                const row = Math.floor(index / cols);
                return {
                    ...table,
                    x: minX + col * tableWidth,
                    y: minY + row * tableHeight,
                };
            })
        );

        setSelectedTable(null);
    }, [tables]);

    const unassignedGuests = guests.filter((guest) => !guest.tableId);
    const assignedGuests = guests.filter((guest) => guest.tableId);

    // Zoom functionality
    const handleZoomIn = useCallback(() => {
        setZoom((prev) => Math.min(prev + 0.1, 2));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom((prev) => Math.max(prev - 0.1, 0.3));
    }, []);

    const handleZoomReset = useCallback(() => {
        setZoom(1);
    }, []);

    // Planning area component with drop functionality
    const PlanningArea = () => {
        const planningRef = useRef<HTMLDivElement>(null);

        const [isOver, setIsOver] = useState(false);

        const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
            setIsOver(true);
        };

        const handleDragLeave = (e: React.DragEvent) => {
            if (!planningRef.current?.contains(e.relatedTarget as Node)) {
                setIsOver(false);
            }
        };

        const handleDrop = (e: React.DragEvent) => {
            e.preventDefault();
            setIsOver(false);

            try {
                const data = e.dataTransfer.getData("application/json");
                if (data) {
                    const item = JSON.parse(data);
                    if (item.type === "table") {
                        const planningRect = planningRef.current?.getBoundingClientRect();
                        if (planningRect) {
                            // Calculate position relative to the planning area, centered on the table
                            const x = Math.max(120, e.clientX - planningRect.left - 120); // Account for table width/2
                            const y = Math.max(80, e.clientY - planningRect.top - 80); // Account for table height/2
                            moveTable(item.id, x, y);
                        }
                    }
                }
            } catch (error) {
                console.error("Error handling drop:", error);
            }
        };

        return (
            <div
                ref={planningRef}
                className={`relative p-4 transition-colors ${isOver ? "bg-blue-50" : ""}`}
                style={{
                    minWidth: `${1400 * zoom}px`,
                    minHeight: `${1000 * zoom}px`,
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                    width: `${1400}px`,
                    height: `${1000}px`,
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {tables.map((table) => (
                    <Table
                        key={table.id}
                        table={table}
                        allGuests={guests}
                        allTables={tables}
                        isSelected={selectedTable === table.id}
                        onSelect={setSelectedTable}
                        onAssignGuest={assignGuestToTable}
                        onRemoveGuest={removeGuestFromTable}
                        onRemoveTable={removeTable}
                        onMoveTable={moveTable}
                        onRenameTable={renameTable}
                    />
                ))}

                {tables.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Card className="p-8 text-center">
                            <h3>No tables yet</h3>
                            <p className="text-muted-foreground">
                                Add your first table using the controls in the sidebar
                            </p>
                        </Card>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <div
                className={`group relative border-r border-border flex flex-col transition-[width] duration-300 ease-in-out ${
                    sidebarCollapsed ? "w-12" : "w-80"
                }`}
            >
                <div
                    className={`flex items-center justify-between gap-2 p-4 border-b border-border flex-shrink-0 ${sidebarCollapsed ? "p-2" : ""}`}
                >
                    {sidebarCollapsed ? (
                        <span className="sr-only">Sidebar collapsed</span>
                    ) : (
                        <div>
                            <h2>Event Table Planner</h2>
                            <p className="text-muted-foreground">{guests.length} Guests</p>
                        </div>
                    )}
                    <button
                        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        onClick={() => setSidebarCollapsed((v) => !v)}
                        className="ml-auto h-7 w-7 rounded-md border bg-white hover:bg-blue-50 flex items-center justify-center shadow-sm"
                    >
                        {sidebarCollapsed ? (
                            <ChevronRight className="w-4 h-4" />
                        ) : (
                            <ChevronLeft className="w-4 h-4" />
                        )}
                    </button>
                </div>

                <div
                    className={`flex-1 overflow-y-auto ${sidebarCollapsed ? "opacity-0 pointer-events-none select-none" : "opacity-100"} transition-opacity duration-200`}
                >
                    {!sidebarCollapsed && (
                        <div className="flex flex-col">
                            <Summary
                                totalGuests={guests.length}
                                assignedGuests={assignedGuests.length}
                                tables={tables}
                            />
                            <Separator />
                            <Controls
                                onAddTable={addTable}
                                onImportGuests={importGuests}
                                onImportLayout={importLayout}
                                onAutoLayout={autoLayoutTables}
                                onUndo={undo}
                                onResetAssignments={resetAllAssignments}
                                tables={tables}
                                guests={guests}
                                canUndo={history.length > 0}
                            />
                            <Separator />
                            <GuestForm onAddGuest={addGuest} tables={tables} />
                            <Separator />
                            <AssignedGuestsList guests={assignedGuests} tables={tables} />
                            <GuestList
                                guests={unassignedGuests}
                                selectedGuests={selectedGuests}
                                onToggleSelection={toggleGuestSelection}
                                onClearSelection={clearGuestSelection}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Main planning area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Zoom controls */}
                <div className="absolute top-4 right-4 z-10 flex gap-1 bg-white/90 backdrop-blur-sm rounded-lg border p-1">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleZoomOut}
                        disabled={zoom <= 0.3}
                        className="h-8 w-8 p-0"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleZoomReset}
                        className="h-8 px-2 min-w-[50px] text-xs"
                    >
                        {Math.round(zoom * 100)}%
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleZoomIn}
                        disabled={zoom >= 2}
                        className="h-8 w-8 p-0"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                </div>

                {/* Scrollable planning area */}
                <div className="flex-1 overflow-auto bg-gray-50">
                    <PlanningArea />
                </div>
            </div>
            <Toaster />
        </div>
    );
}
