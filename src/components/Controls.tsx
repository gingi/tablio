import React, { useRef, useState } from "react";
import { TableData, Guest } from "./TablePlanner";
import { Button } from "./ui/button";
import { PlusIcon as Plus, DownloadIcon as Download, SaveIcon as Save, FolderOpenIcon as FolderOpen, Grid3X3Icon as Grid3X3, UndoIcon as Undo, RotateCcwIcon as RotateCcw } from "./icons";
import { toast } from "sonner@2.0.3";
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

    const exportCompleteData = async () => {
        const completeData = {
            guests,
            tables,
            exportDate: new Date().toISOString(),
            version: "1.0",
        };

        const jsonContent = JSON.stringify(completeData, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });

        // Try File System Access API for native Save As dialog
        interface SavePickerTypeEntry { description?: string; accept: Record<string, string[]> }
        interface SavePickerOptions { suggestedName?: string; types?: SavePickerTypeEntry[] }
        interface WritableFile { write: (data: Blob) => Promise<void>; close: () => Promise<void> }
        interface FileHandle { createWritable: () => Promise<WritableFile> }
        const w = window as unknown as { showSaveFilePicker?: (options: SavePickerOptions) => Promise<FileHandle> };
        if (typeof w.showSaveFilePicker === "function") {
            try {
                const handle = await w.showSaveFilePicker({
                    suggestedName: "tablio.json",
                    types: [
                        {
                            description: "Tablio Layout",
                            accept: { "application/json": [".json"] },
                        },
                    ],
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
                toast.success("Layout exported");
                return;
            } catch (err) {
                if ((err as { name?: string })?.name === "AbortError") return; // user canceled
                console.warn("showSaveFilePicker failed, falling back", err);
            }
        }

        // Fallback: anchor download with default filename
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "tablio.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Layout downloaded");
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
                    <div className="text-sm text-muted-foreground mb-2">
                        Quick Actions
                    </div>
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
                    <div className="text-sm text-muted-foreground mb-2">
                        Add New Table
                    </div>
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
                    <div className="text-sm text-muted-foreground mb-2">Layout Tools</div>
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
                    <div className="text-sm text-muted-foreground mb-2">Export Data</div>
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
                    <div className="text-sm text-muted-foreground mb-2">
                        Import Layout
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImportLayout}
                        className="hidden"
                        tabIndex={-1}
                        aria-hidden="true"
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

            </div>
        </div>
    );
}
