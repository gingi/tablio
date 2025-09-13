import React, { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Guest } from "./TablePlanner";

interface CSVImportProps {
    onImport: (guests: Guest[]) => void;
}

export function CSVImport({ onImport }: CSVImportProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [importResult, setImportResult] = useState<{
        success: boolean;
        message: string;
        count?: number;
    } | null>(null);

    const parseCSV = (csvText: string): Guest[] => {
        const lines = csvText.trim().split("\n");
        if (lines.length === 0) return [];

        // Get headers from first line
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
        const guests: Guest[] = [];

        // Find column indices
        const nameIndex = headers.findIndex((h) => h.includes("name"));
        const categoryIndex = headers.findIndex(
            (h) => h.includes("category") || h.includes("group")
        );
        const dietaryIndex = headers.findIndex(
            (h) => h.includes("dietary") || h.includes("diet") || h.includes("allergy")
        );

        if (nameIndex === -1) {
            throw new Error('CSV must contain a "name" column');
        }

        // Process data rows
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));

            if (values.length > nameIndex && values[nameIndex]) {
                const guest: Guest = {
                    id: `imported-${Date.now()}-${i}`,
                    name: values[nameIndex],
                    category:
                        categoryIndex !== -1 && values[categoryIndex]
                            ? values[categoryIndex]
                            : undefined,
                    dietary:
                        dietaryIndex !== -1 && values[dietaryIndex]
                            ? values[dietaryIndex]
                            : undefined,
                };
                guests.push(guest);
            }
        }

        return guests;
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith(".csv")) {
            setImportResult({
                success: false,
                message: "Please select a CSV file",
            });
            return;
        }

        setIsProcessing(true);
        setImportResult(null);

        try {
            const text = await file.text();
            const guests = parseCSV(text);

            if (guests.length === 0) {
                throw new Error("No valid guest records found in CSV");
            }

            onImport(guests);
            setImportResult({
                success: true,
                message: `Successfully imported ${guests.length} guests`,
                count: guests.length,
            });

            // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error) {
            setImportResult({
                success: false,
                message: error instanceof Error ? error.message : "Failed to import CSV",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadSampleCSV = () => {
        const sampleData = [
            "Name,Category,Dietary",
            "John Smith,Family,",
            "Jane Doe,Friends,Vegetarian",
            "Bob Johnson,Colleagues,Gluten-Free",
            "Sarah Wilson,VIP,Vegan",
        ].join("\n");

        const blob = new Blob([sampleData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "guest-list-sample.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-3">
            <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                    Import Guest List
                </label>
                <Card className="p-4">
                    <div className="space-y-3">
                        <div className="text-center">
                            <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <div className="text-sm">Upload a CSV file with your guest list</div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isProcessing}
                                className="flex-1"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                {isProcessing ? "Processing..." : "Upload CSV"}
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={downloadSampleCSV}
                                className="whitespace-nowrap"
                            >
                                Sample
                            </Button>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {importResult && (
                            <Alert
                                className={
                                    importResult.success
                                        ? "border-green-200 bg-green-50"
                                        : "border-red-200 bg-red-50"
                                }
                            >
                                {importResult.success ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                )}
                                <AlertDescription
                                    className={
                                        importResult.success ? "text-green-800" : "text-red-800"
                                    }
                                >
                                    {importResult.message}
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="text-xs text-muted-foreground">
                            <div className="font-medium mb-1">CSV Format:</div>
                            <div>Required: Name</div>
                            <div>Optional: Category, Dietary</div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
