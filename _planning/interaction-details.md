# Portfolio Interaction Details

## Project Grid View
- Clicking a project navigates to a new page with detailed view
- Grid layout adapts responsively (3 columns desktop, 1 column mobile)

## Project Detail View
- Process steps (Understand, Solve, Create, Verify) show different content
- Left/right arrows navigate between process steps
- Header with name and Resume button only visible at page top
- Project name shows collapse/expand arrow

## Process Navigation
- Steps: Understand, Solve, Create, Verify
- Active step indicated by underline and color change
- Content transitions with fade and slide animation
  * Next step: Content slides in from right
  * Previous step: Content slides in from left
- Always resets to first step (Understand) when loading new project

## Navigation
- URL-based routing between projects
- Process step content changes within same page
- Smooth transitions between content changes
- Project navigation preserves scroll position
- Step navigation scrolls to top
