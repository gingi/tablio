# Event Table Planning Application - Specification

## Overview

The Event Table Planning Application is a comprehensive web-based tool designed to help event organizers efficiently manage seating arrangements for events with up to 160 guests. The application provides an intuitive drag-and-drop interface for assigning guests to tables, with visual feedback and comprehensive management features.

## Core Features

### 1. Table Management

#### Table Configuration
- **Fixed Oval Tables**: All tables are oval-shaped with a maximum capacity of 12 guests each
- **Optimal Capacity Range**: Tables ideally accommodate 8-12 guests for best seating experience
- **Dynamic Table Creation**: Automatically calculates and creates the appropriate number of tables based on guest count
- **Visual Table Representation**: Each table displays guest positions in an oval layout with numbered seats

#### Table Status Indicators
- **Gray**: Empty table (0 guests)
- **Yellow**: Under capacity (1-7 guests) - indicates suboptimal seating
- **Green**: Ideal capacity (8-12 guests) - optimal seating arrangement
- **Red**: Over capacity (>12 guests) - indicates overcrowding (should not occur with proper validation)

### 2. Guest Management System

#### Guest Creation and Editing
- **Guest Form Modal**: Dedicated form for adding new guests with validation
- **Required Fields**: Guest name (required)
- **Optional Fields**: Category assignment for organizational purposes
- **Bulk Import**: CSV import functionality for adding multiple guests at once
- **Guest Editing**: Modify guest information after creation

#### Guest Categorization
- **Predefined Categories**: Family, Friends, Colleagues, VIP
- **Custom Categories**: Support for additional custom categories
- **Category-based Filtering**: Filter and search guests by category
- **Visual Category Indicators**: Color-coded badges for easy identification

#### Guest Assignment
- **Drag-and-Drop Assignment**: Intuitive drag-and-drop interface for moving guests between tables and seats
- **Seat-Level Precision**: Assign guests to specific numbered seats within tables
- **Assignment Validation**: Prevents over-assignment and provides feedback
- **Quick Assignment**: Right-click context menu for rapid guest assignment

### 3. Search and Filtering

#### Global Guest Search
- **Real-time Search**: Instant filtering of guest list as you type
- **Name-based Search**: Search guests by name with partial matching
- **Case-insensitive Matching**: Flexible search that ignores case differences

#### Advanced Filtering
- **Category Filtering**: Filter guests by specific categories
- **Assignment Status**: Filter by assigned/unassigned status
- **Combined Filters**: Use search and category filters simultaneously
- **Clear Filter Options**: Easy reset of all applied filters

#### Seat Context Menu Search
- **Per-seat Search**: Search for specific guests when assigning to individual seats
- **Contextual Filtering**: Filter options within seat assignment context
- **Quick Assignment**: Direct assignment from search results

### 4. Visual Interface

#### Main Planning Area
- **Responsive Layout**: Adaptable interface that works on different screen sizes
- **Table Grid**: Organized display of all tables with clear spacing
- **Guest Positioning**: Visual representation of where each guest is seated
- **Drag Indicators**: Visual feedback during drag-and-drop operations

#### Sidebar Management
- **Fixed Sidebar**: Persistent sidebar with scrollable content
- **Guest Lists**: Separate sections for unassigned and assigned guests
- **Search Controls**: Dedicated search and filter controls
- **Summary Information**: Real-time statistics and capacity information

### 5. Data Management

#### Persistence
- **LocalStorage Integration**: Automatic saving of all data to browser's local storage
- **Session Recovery**: Restore previous session data on page reload
- **Real-time Updates**: Immediate saving of all changes

#### Export/Import Functionality
- **Session Export**: Export complete session state including all guests and assignments
- **Session Import**: Import previously exported session files
- **CSV Guest Import**: Bulk import guests from CSV files
- **Data Validation**: Validate imported data for consistency and completeness

#### Undo/Redo System
- **Action History**: Track all user actions for undo capability
- **Multiple Undo Levels**: Support for multiple consecutive undo operations
- **Action Types**: Undo guest assignments, deletions, and modifications

### 6. Event Summary and Analytics

#### Capacity Overview
- **Total Guest Count**: Real-time count of all guests in the event
- **Assigned vs Unassigned**: Clear breakdown of guest assignment status
- **Table Utilization**: Overview of how efficiently tables are being used
- **Remaining Capacity**: Available seats across all tables

#### Table Statistics
- **Per-table Guest Count**: Individual table occupancy numbers
- **Optimal Seating Analysis**: Identification of tables that could be optimized
- **Category Distribution**: Overview of how different guest categories are distributed

### 7. User Experience Features

#### Intuitive Navigation
- **Clear Visual Hierarchy**: Well-organized interface with logical grouping
- **Contextual Actions**: Right-click menus and hover states for quick actions
- **Keyboard Shortcuts**: Support for common keyboard shortcuts (Escape to close modals)
- **Loading States**: Appropriate feedback during data operations

#### Responsive Design
- **Mobile Compatibility**: Functional interface on tablets and mobile devices
- **Adaptive Layout**: Interface adjusts to different screen sizes
- **Touch Support**: Drag-and-drop works with touch interfaces

#### Error Handling
- **Validation Feedback**: Clear error messages for invalid operations
- **Graceful Degradation**: App continues to function even with partial data loss
- **User Guidance**: Helpful hints and tooltips throughout the interface

## Technical Architecture

### Frontend Framework
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first styling with custom design system

### Component Architecture
- **Modular Design**: Reusable components for maintainability
- **ShadCN UI**: Consistent UI component library
- **Custom Components**: Purpose-built components for specific functionality

### State Management
- **React Hooks**: useState and useEffect for local component state
- **Context API**: Global state management where needed
- **Local Storage**: Persistent state across browser sessions

### Data Models

#### Guest Model
```typescript
interface Guest {
  id: string;
  name: string;
  category?: string;
  tableId?: string;
  seatNumber?: number;
}
```

#### Table Model
```typescript
interface Table {
  id: string;
  name: string;
  guests: Guest[];
  capacity: number;
}
```

## Usage Guidelines

### Getting Started
1. **Add Guests**: Use the guest form or CSV import to add event attendees
2. **Assign Categories**: Organize guests by relationship or importance
3. **Plan Tables**: Use drag-and-drop to assign guests to tables and specific seats
4. **Optimize Layout**: Use visual indicators to ensure optimal table capacity
5. **Export Data**: Save your complete seating arrangement for future reference

### Best Practices
- **Aim for 8-12 guests per table** for optimal social interaction
- **Group similar categories** when appropriate (e.g., family members together)
- **Use the search function** for quick guest location in large events
- **Regular exports** to backup your seating arrangements
- **Review summary statistics** to ensure balanced table distribution

### Performance Considerations
- **Optimized for up to 160 guests** with smooth performance
- **Efficient rendering** with minimal re-renders during drag operations
- **Local storage limitations** - consider periodic exports for large events
- **Browser compatibility** - works best in modern browsers with full feature support

## Future Enhancement Opportunities

### Potential Features
- **Multi-event Management**: Handle multiple events within the same application
- **Guest Dietary Restrictions**: Track and display dietary requirements
- **Table Shape Options**: Support for round, rectangular, and other table shapes
- **Seating Preferences**: Guest-specific seating preferences and conflicts
- **Print Layouts**: Generate printable seating charts and name cards
- **Real-time Collaboration**: Multiple planners working on the same event
- **Integration APIs**: Connect with event management platforms
- **Advanced Analytics**: Detailed reporting on seating patterns and optimization

This specification serves as a comprehensive guide to the Event Table Planning Application's current capabilities and intended use cases.