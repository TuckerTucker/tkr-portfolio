# Component Analysis & Requirements

## 1. Button Component
**Path**: `/src/components/ui/button.jsx`
**Type**: shadcn/ui component
**Dependencies**:
- `class-variance-authority` for variants
- `@/lib/utils` for cn utility

**Variants to Document**:
- variant: default, destructive, outline, secondary, ghost, link
- size: default, sm, lg, icon
- asChild: boolean for composition

## 2. ThemeToggle Component
**Path**: `/src/components/ui/theme-toggle.jsx`
**Type**: Custom theme switcher
**Dependencies**:
- React hooks (useState, useEffect)
- Local storage for persistence

**States to Document**:
- Light mode active
- Dark mode active
- System preference mode
- Transition animations

## 3. Card Component
**Path**: `/src/components/ui/card.jsx`
**Type**: shadcn/ui component
**Dependencies**:
- Compound component pattern

**Sub-components**:
- Card
- CardHeader
- CardFooter
- CardTitle
- CardDescription
- CardContent

## 4. Carousel Component
**Path**: `/src/components/ui/carousel.jsx`
**Type**: Embla carousel wrapper
**Dependencies**:
- `embla-carousel-react`
- Custom navigation controls

**Features to Document**:
- Basic image carousel
- Custom content carousel
- Auto-play functionality
- Navigation indicators
- Touch/swipe support

## 5. DropdownMenu Component
**Path**: `/src/components/ui/dropdown-menu.jsx`
**Type**: Radix UI wrapper
**Dependencies**:
- `@radix-ui/react-dropdown-menu`

**Sub-components**:
- DropdownMenu
- DropdownMenuTrigger
- DropdownMenuContent
- DropdownMenuItem
- DropdownMenuSeparator
- DropdownMenuCheckboxItem
- DropdownMenuRadioGroup

## 6. ProjectCard Component
**Path**: `/src/components/custom/project-card.jsx`
**Type**: Custom composite component
**Dependencies**:
- Card component
- Badge component (if exists)
- Image handling

**Props to Document**:
- title
- description
- image
- technologies
- link
- featured

## 7. BulletList Component
**Path**: `/src/components/custom/bullet-list.jsx`
**Type**: Custom list component
**Dependencies**:
- Custom styling
- Animation utilities

**Features to Document**:
- Basic list
- Nested lists
- Custom bullet icons
- Hover effects
- Responsive behavior