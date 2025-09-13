import React, { useRef, useState } from "react";
import { TableData, Guest } from "./TablePlanner";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Plus, Users, Download, Save, FolderOpen, Grid3X3, Undo, RotateCcw } from "lucide-react";
import { CSVImport } from "./CSVImport";
import { Separator } from "./ui/separator";

interface ControlsProps {
    onAddTable: (seats: number) => void;
    onImportGuests: (guests: Guest[]) => void;
    onImportLayout: (data: { guests: Guest[]; tables: TableData[] }) => void;
    onAutoLayout: () => void;
    onUndo: () => void;
    onResetAssignments: () => void;
    tables: TableData[];
    guests: Guest[];
    canUndo: boolean;
}

export function Controls({
    onAddTable,
    onImportGuests,
    onImportLayout,
    onAutoLayout,
    onUndo,
    onResetAssignments,
    tables,
    guests,
    canUndo,
}: ControlsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const exportAssignments = () => {
        const assignments: { name: string; table: string }[] = [];

        tables.forEach((table) => {
            table.guests.forEach((guest) => {
                assignments.push({
                    name: guest.name,
                    table: table.name,
                });
            });
        });

        // Create CSV content
        const csvContent = [
            "Name,Table",
            ...assignments.map((assignment) => `"${assignment.name}","${assignment.table}"`),
        ].join("\n");

        // Download CSV
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `table-assignments-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const exportCompleteData = () => {
        const completeData = {
            guests,
            tables,
            exportDate: new Date().toISOString(),
            version: "1.0",
        };

        const jsonContent = JSON.stringify(completeData, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `event-layout-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportLayout = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (data.guests && data.tables) {
                    onImportLayout(data);
                } else {
                    alert("Invalid file format. Please select a valid event layout file.");
                }
            } catch (error) {
                alert("Error reading file. Please select a valid JSON file.");
            }
        };
        reader.readAsText(file);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="p-4">
            <h3>Table Controls</h3>

            <div className="space-y-3 mt-3">
                <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                        Quick Actions
                    </label>
                    <div className="space-y-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onUndo}
                            className="flex items-center gap-1 w-full"
                            disabled={!canUndo}
                        >
                            <Undo className="w-3 h-3" />
                            Undo Last Action
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowResetConfirm(true)}
                            className="flex items-center gap-1 w-full"
                            disabled={tables.every((t) => t.guests.length === 0)}
                        >
                            <RotateCcw className="w-3 h-3" />
                            Reset All Assignments
                        </Button>
                        {showResetConfirm && (
                            <div className="mt-2 p-3 border rounded-md bg-white shadow-sm space-y-2">
                                <div className="text-xs font-medium">
                                    Clear all guest assignments? This cannot be undone.
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="h-6 text-xs"
                                        onClick={() => {
                                            onResetAssignments();
                                            setShowResetConfirm(false);
                                        }}
                                    >
                                        Confirm
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 text-xs"
                                        onClick={() => setShowResetConfirm(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                    {!canUndo && (
                        <div className="text-xs text-muted-foreground mt-1">No actions to undo</div>
                    )}
                    {tables.every((t) => t.guests.length === 0) && (
                        <div className="text-xs text-muted-foreground mt-1">
                            No assignments to reset
                        </div>
                    )}
                </div>

                <Separator />

                <CSVImport onImport={onImportGuests} />

                <Separator />

                <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                        Add New Table
                    </label>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddTable(12)}
                        className="flex items-center gap-1 w-full"
                    >
                        <Plus className="w-3 h-3" />
                        Add Oval Table (12 seats)
                    </Button>
                </div>

                <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Layout Tools</label>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onAutoLayout}
                        className="flex items-center gap-1 w-full"
                        disabled={tables.length === 0}
                    >
                        <Grid3X3 className="w-3 h-3" />
                        Auto Layout Tables
                    </Button>
                    {tables.length === 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                            Add tables first to use auto layout
                        </div>
                    )}
                </div>

                <Separator />

                <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Export Data</label>
                    <div className="space-y-2">
                        <Button
                            variant="default"
                            size="sm"
                            onClick={exportAssignments}
                            className="flex items-center gap-1 w-full"
                            disabled={tables.every((t) => t.guests.length === 0)}
                        >
                            <Download className="w-3 h-3" />
                            Export Assignments (CSV)
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={exportCompleteData}
                            className="flex items-center gap-1 w-full"
                        >
                            <Save className="w-3 h-3" />
                            Export Complete Layout (JSON)
                        </Button>
                    </div>
                    {tables.every((t) => t.guests.length === 0) && (
                        <div className="text-xs text-muted-foreground mt-1">
                            No assignments to export
                        </div>
                    )}
                </div>

                <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                        Import Layout
                    </label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImportLayout}
                        className="hidden"
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1 w-full"
                    >
                        <FolderOpen className="w-3 h-3" />
                        Import Complete Layout
                    </Button>
                    <div className="text-xs text-muted-foreground mt-1">
                        Import guests, tables, and layout positions
                    </div>
                </div>

                <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                        Current Tables
                    </label>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                        {tables.length === 0 ? (
                            <div className="text-xs text-muted-foreground italic">
                                No tables added yet
                            </div>
                        ) : (
                            tables.map((table) => (
                                <Card key={table.id} className="p-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-3 h-3 text-muted-foreground" />
                                            <span className="text-sm">{table.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
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
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
