# SmartAid Mobile App - Design Guidelines

## Design Approach
**Accessibility-First Design System** - Custom guidelines optimized for elderly users with mobility and vision considerations. Draws from Material Design's accessibility patterns and healthcare app best practices while prioritizing simplicity over aesthetics.

## Core Design Principles
1. **Maximum Readability** - Every element must be instantly comprehensible
2. **Error Prevention** - Design choices that minimize user mistakes
3. **Confidence Building** - Visual feedback that reassures users they're doing it right
4. **Touch-First** - Designed for fingers, not cursors

## Typography
**Font Family**: System fonts (San Francisco for iOS, Roboto for Android)
- **Headings**: 28-32pt, Bold (600-700 weight)
- **Body Text**: 20-24pt, Regular (400 weight) - never below 18pt
- **Button Labels**: 22-26pt, Semi-bold (600 weight)
- **Status Text**: 18-20pt, Medium (500 weight)
- **Line Height**: 1.5-1.6 for optimal readability
- **Letter Spacing**: Slightly increased (0.02em) for clarity

## Layout System
**Spacing Scale**: Use units of 4, 6, 8, 12, 16, 24 - keep layouts breathable
- **Screen Padding**: 6 (24px) on all sides
- **Component Spacing**: 8 (32px) between major sections
- **Card Padding**: 6 (24px) internal padding
- **Button Padding**: Vertical 4 (16px), Horizontal 8 (32px)

**Touch Targets**: Minimum 48x48px (12 units), prefer 56-64px (14-16 units)

## Component Library

### Navigation
- **Bottom Navigation Bar** (persistent, 4-5 items max)
  - Icons: 32px minimum
  - Labels: Always visible (not icon-only)
  - Active state: Bold text + icon fill
  - Items: Home, Schedule, History, Camera, Settings

### Pill Scanning Interface
- **Camera Viewfinder**: Full-screen with rounded corners overlay showing scan area
- **Capture Button**: 80x80px circular button at bottom center
- **Instruction Text**: Top overlay with white text on semi-transparent dark background
- **Flash Toggle**: 56x56px button in top-right corner

### Medication Cards
- **Large Card Layout**: Full-width minus padding
- **Pill Image/Icon**: 80x80px on left side
- **Medication Name**: 24pt bold
- **Dosage Info**: 20pt regular, below name
- **Time Display**: 22pt medium, right-aligned
- **Status Badge**: 48px height pill-shaped badge (Taken/Missed/Pending)
- **Action Button**: Full-width, 56px height within card
- **Rounded Corners**: 16px radius

### Buttons
- **Primary Action**: 56px height, full-width or minimum 200px wide, 16px rounded corners
- **Secondary Action**: 48px height, outlined style, same width rules
- **Icon Buttons**: 56x56px, circular, for single actions
- **Destructive Actions**: Same sizing, visually distinct treatment

### Status Indicators
- **Large Icons**: 48-64px for success/error/warning states
- **Progress Indicators**: Chunky, high-contrast spinner (not subtle)
- **Badges**: Minimum 32px height with 8px internal padding

### Forms & Inputs
- **Text Input Fields**: 56px height, 20pt text, 16px rounded corners
- **Labels**: Above inputs, 18pt medium weight
- **Helper Text**: 16pt, below inputs
- **Checkboxes/Radio**: 32x32px minimum
- **Toggle Switches**: 64x40px (oversized for easy manipulation)

### Dialogs & Modals
- **Confirmation Dialogs**: Center-screen, max 90% width, generous padding (8 units)
- **Action Buttons**: Stacked vertically (not side-by-side), 16px spacing
- **Title**: 26pt bold
- **Message**: 20pt regular, centered

### History View
- **Timeline Layout**: Vertical list with date separators
- **Date Headers**: 22pt semi-bold, sticky positioning
- **Log Entries**: Card-based, 20pt text showing pill name, time, status
- **Icons**: 40px for each entry status

## Accessibility Features
- **High Contrast Mode**: Ensure 7:1 contrast ratio minimum (WCAG AAA)
- **Focus Indicators**: 4px solid outline, never subtle
- **Screen Reader**: All interactive elements properly labeled
- **Haptic Feedback**: On all button taps and confirmations
- **Voice Readback**: Medication names and times announced when displayed

## Animations
**Minimize distractions** - Use sparingly for feedback only:
- **Button Press**: Subtle scale (0.95) on tap, 100ms
- **Page Transitions**: Simple slide (200ms) between screens
- **Success Feedback**: Brief checkmark animation (300ms)
- **Loading States**: Simple spinner, no elaborate animations

## Images
**Medication Icons/Photos**:
- Use clear, well-lit photos of actual pills when available
- Fallback to simple, large icons representing pill types (capsule, tablet, liquid)
- All images: 80x80px in lists, 160x160px in detail views
- White or neutral background for pill photos

**No Hero Images** - This is a utility app, launch directly into functionality

## Screen-Specific Layouts

### Home Screen
- Large "Scan Pill Now" primary button (80px height, full-width)
- Today's Schedule preview (3-4 upcoming medications)
- Quick stats: "X of Y taken today" (large numbers, 32pt)

### Schedule Screen
- Scrollable list of medication cards
- Date selector at top (large tabs for Today/Tomorrow)
- Add medication button (floating, 64x64px, bottom-right)

### Camera Screen
- Full-screen camera with minimal UI
- Instruction text overlay at top
- Large capture button at bottom
- Cancel button (top-left, 56x56px)

### History Screen
- Filterable timeline (Last 7 Days, Last 30 Days)
- Export/Share button for caregivers (top-right)
- Adherence percentage displayed prominently at top

### Settings Screen
- Large toggle switches for notifications
- Caregiver contact management (big, tappable cards)
- Simple list layout with 24px spacing between items