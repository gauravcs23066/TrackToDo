# TrackToDo - Design Mockups

## Main Interface Mockup

### Header Section
```
┌─────────────────────────────────────────────────────────────┐
│ 🎯 TrackToDo                    Progress: 3/5 (60%) ████████ │
└─────────────────────────────────────────────────────────────┘
```

### Add Task Section
```
┌─────────────────────────────────────────────────────────────┐
│ + Add New Task                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Task Title                                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Description (optional)                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Priority: [🔴 High] [🟠 Medium] [⚪ Low]  [Add Task]      │
└─────────────────────────────────────────────────────────────┘
```

### Task List Section
```
┌─────────────────────────────────────────────────────────────┐
│ Filter: [All] [High] [Medium] [Low]  Sort: [Priority] [Date]│
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔴 High Priority                    [✓] Complete        │ │
│ │ Complete project documentation                          │ │
│ │ Finish the API documentation for the backend...        │ │
│ │ Created: 2 hours ago              [Edit] [Delete]       │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🟠 Medium Priority                  [ ] Incomplete      │ │
│ │ Review code changes                                    │ │
│ │ Go through the pull requests and provide feedback      │ │
│ │ Created: 1 day ago               [Edit] [Delete]       │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⚪ Low Priority                     [✓] Complete         │ │
│ │ Update README file                                     │ │
│ │ Add installation instructions                          │ │
│ │ Created: 3 days ago              [Edit] [Delete]       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Mobile Interface Mockup

### Mobile Header
```
┌─────────────────────────┐
│ 🎯 TrackToDo            │
│ Progress: 3/5 (60%)     │
│ ████████                │
└─────────────────────────┘
```

### Mobile Add Task
```
┌─────────────────────────┐
│ + Add New Task          │
│ ┌─────────────────────┐ │
│ │ Task Title          │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Description         │ │
│ └─────────────────────┘ │
│ Priority:              │
│ [🔴] [🟠] [⚪]         │
│        [Add Task]      │
└─────────────────────────┘
```

### Mobile Task List
```
┌─────────────────────────┐
│ [All] [High] [Med] [Low]│
├─────────────────────────┤
│ 🔴 Complete project     │
│    documentation        │
│    [✓] [Edit] [Delete] │
├─────────────────────────┤
│ 🟠 Review code changes  │
│    [ ] [Edit] [Delete]  │
├─────────────────────────┤
│ ⚪ Update README        │
│    [✓] [Edit] [Delete] │
└─────────────────────────┘
```

## Component Specifications

### Button Styles
```css
/* Primary Button */
background: #3B82F6
color: white
border-radius: 8px
padding: 12px 24px
font-weight: 600

/* Secondary Button */
background: transparent
color: #3B82F6
border: 2px solid #3B82F6
border-radius: 8px
padding: 10px 22px

/* Danger Button */
background: #EF4444
color: white
border-radius: 8px
padding: 12px 24px
```

### Input Field Styles
```css
/* Text Input */
border: 2px solid #E5E7EB
border-radius: 8px
padding: 12px 16px
font-size: 16px
transition: border-color 150ms

/* Focus State */
border-color: #3B82F6
box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1)
```

### Task Card Styles
```css
/* Task Card */
background: #F9FAFB
border: 1px solid #E5E7EB
border-radius: 12px
padding: 16px
margin-bottom: 12px
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)

/* High Priority Card */
border-left: 4px solid #EF4444

/* Medium Priority Card */
border-left: 4px solid #F59E0B

/* Low Priority Card */
border-left: 4px solid #6B7280
```

## Icon Specifications
- **Add Task**: Plus icon (+)
- **Edit**: Pencil icon (✏️)
- **Delete**: Trash icon (🗑️)
- **Complete**: Checkmark (✓)
- **Priority**: Colored dots (🔴🟠⚪)
- **Progress**: Progress bar (████████)
