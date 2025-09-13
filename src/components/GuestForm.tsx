import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus } from 'lucide-react';
import { Badge } from './ui/badge';
import { TableData } from './TablePlanner';

interface GuestFormProps {
  onAddGuest: (name: string, category?: string, dietary?: string, tableId?: string) => void;
  tables?: TableData[];
}

export function GuestForm({ onAddGuest, tables = [] }: GuestFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('');
  const [dietary, setDietary] = useState<string>('');
  const [tableId, setTableId] = useState<string>('');

  const categories = ['Family', 'Friends', 'Colleagues', 'VIP'];
  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Halal', 'Kosher'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddGuest(
        name.trim(),
        category && category !== 'none' ? category : undefined,
        dietary && dietary !== 'none' ? dietary : undefined,
        tableId && tableId !== 'none' ? tableId : undefined
      );
      setName('');
      setCategory('');
      setDietary('');
      setTableId('');
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setCategory('');
    setDietary('');
    setTableId('');
    setIsOpen(false);
  };

  return (
    <div className="p-4 border-b border-border">
      <Button 
        className="w-full" 
        variant="outline"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Guest
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Guest</DialogTitle>
            <DialogDescription>
              Fill in the guest details below. All fields except name are optional.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guest-name">Name *</Label>
              <Input
                id="guest-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter guest name"
                autoFocus
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            cat === 'Family' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                            cat === 'Friends' ? 'bg-green-100 text-green-800 border-green-300' :
                            cat === 'Colleagues' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                            cat === 'VIP' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                            'bg-gray-100 text-gray-800 border-gray-300'
                          }`}
                        >
                          {cat}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest-dietary">Dietary Requirements</Label>
              <Select value={dietary} onValueChange={setDietary}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dietary requirements (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No dietary requirements</SelectItem>
                  {dietaryOptions.map(diet => (
                    <SelectItem key={diet} value={diet}>
                      {diet}
                    </SelectItem>
                  ))}</SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest-table">Table Assignment</Label>
              <Select value={tableId} onValueChange={setTableId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select table (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No table assignment</SelectItem>
                  {tables.map(table => (
                    <SelectItem key={table.id} value={table.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{table.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {table.guests.length}/12
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Add Guest
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}