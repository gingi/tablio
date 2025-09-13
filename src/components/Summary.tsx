import React from "react";
import { TableData } from "./TablePlanner";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Users, Calendar, CheckCircle } from "lucide-react";

interface SummaryProps {
    totalGuests: number;
    assignedGuests: number;
    tables: TableData[];
}

export function Summary({ totalGuests, assignedGuests, tables }: SummaryProps) {
    const unassignedGuests = totalGuests - assignedGuests;
    const totalSeats = tables.reduce((sum, table) => sum + table.seats, 0);
    const assignmentProgress = totalGuests > 0 ? (assignedGuests / totalGuests) * 100 : 0;

    return (
        <div className="p-4">
            <h3>Event Summary</h3>

            <div className="space-y-3 mt-3">
                <Card className="p-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">Guest Assignment</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {assignedGuests}/{totalGuests}
                        </span>
                    </div>
                    <Progress value={assignmentProgress} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">
                        {unassignedGuests} guests remaining
                    </div>
                </Card>

                <div className="grid grid-cols-2 gap-2">
                    <Card className="p-3 text-center">
                        <div className="text-lg font-medium">{tables.length}</div>
                        <div className="text-xs text-muted-foreground">Tables</div>
                    </Card>

                    <Card className="p-3 text-center">
                        <div className="text-lg font-medium">{totalSeats}</div>
                        <div className="text-xs text-muted-foreground">Total Seats</div>
                    </Card>
                </div>

                {totalSeats > 0 && (
                    <Card className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Seating Capacity</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {totalSeats >= totalGuests ? (
                                <div className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="w-3 h-3" />
                                    Sufficient capacity
                                </div>
                            ) : (
                                <div className="text-red-600">
                                    Need {totalGuests - totalSeats} more seats
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                {tables.length > 0 && (
                    <Card className="p-3">
                        <div className="text-sm mb-2">Table Status</div>
                        <div className="space-y-1">
                            {tables.map((table) => {
                                const count = table.guests.length;
                                const getStatusColor = () => {
                                    if (count === 0) return "text-gray-500";
                                    if (count < 8) return "text-yellow-600";
                                    if (count <= 12) return "text-green-600";
                                    return "text-red-600";
                                };
                                const getStatusText = () => {
                                    if (count === 0) return "Empty";
                                    if (count < 8) return "Under capacity";
                                    if (count < 12) return "Ideal";
                                    return "Full";
                                };

                                return (
                                    <div
                                        key={table.id}
                                        className="flex items-center justify-between text-xs"
                                    >
                                        <span className="truncate flex-1 mr-2">{table.name}</span>
                                        <div className="flex items-center gap-1">
                                            <span className={getStatusColor()}>
                                                {table.guests.length}/12
                                            </span>
                                            <span className={`text-xs ${getStatusColor()}`}>
                                                ({getStatusText()})
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                )}

                {tables.length > 0 && (
                    <Card className="p-3">
                        <div className="text-sm mb-2">Capacity Analysis</div>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span>Ideal tables (8-12):</span>
                                <span className="text-green-600">
                                    {
                                        tables.filter(
                                            (t) => t.guests.length >= 8 && t.guests.length <= 12
                                        ).length
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Under capacity (&lt;8):</span>
                                <span className="text-yellow-600">
                                    {
                                        tables.filter(
                                            (t) => t.guests.length > 0 && t.guests.length < 8
                                        ).length
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Empty tables:</span>
                                <span className="text-gray-500">
                                    {tables.filter((t) => t.guests.length === 0).length}
                                </span>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
