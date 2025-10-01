# UX Skills: The USCV Framework

## Introduction

My UX process follows four core phases: **Understand, Solve, Create, Verify**. This framework keeps me focused on solving the right problems before jumping to solutions.

---

## Understand: Know the Problem You're Solving

The Understanding Phase is simply figuring out the problem to be solved before you start building.

### My Approach

I start every project by immersing myself in stakeholder conversations. At Vidflex, before I could design useful solutions for their video platform, I needed to fully understand the system. I facilitated conversations with the CEO, CTO, CMO, each product owner, every developer, and the customer support team. I conducted usability testing with platform customers.

These findings became my guide to key pain points, opportunities, and feature priorities. The conversations turned into user type avatars, process flow documents, and a feature description library that became the foundation for the full platform design and roadmap.

**Core Questions I Always Answer:**
1. Who is it for?
2. What is its purpose?
3. Is it new or building on existing?
4. When is it needed?

### Example: Vidflex Live Dashboard

**The Challenge:** Vidflex was moving to a Sports-as-a-Service model. The Customer Success team needed timely debugging information for active live streaming events.

**Discovery Process:**
- **Kick-off meeting** with Product Owner and Tech Liaison
- **Purpose statement** defining the specific problem
- **Question mapping** - identifying what we needed to learn and who could answer

**Key Discovery Sessions:**
I interviewed all 5 members of the CX Success team about the information they'd need. Then I identified the data stores that held the information and grouped them by how easy it would be to get via API.

The groups were:
- **Now** - Available via API  
- **With Work** - LOE ranked by devs from 1 to 5

**Software Choice Decision:**
Options included reusing our library widget, Retool, or Grafana. Dev resources were at a premium, so reusing the library widget was no longer an option. Grafana was chosen because of its flexibility and customization while still being a no-code option.

This discovery process took two weeks (one sprint) but saved months of building the wrong thing.

---

## Solve: Identify the Right Approach

Once I understand the problem, I explore multiple solution approaches before committing to one direction.

### My Approach

I sketch interaction flows, map user journeys, and identify the simplest path to solving the core problem. I collaborate with developers early to understand technical constraints and opportunities.

### Example: Vidflex Library Redesign

**The Problem:** The video library had significant usability issues:
1. **'Type'** - Live Stream, VOD, Series were all shown in one view
2. **'Status'** - only used during initial video processing, so always empty
3. **'State'** - informational only, but had the same affordance as 'Update View'
4. **Mobile view** - scrolled horizontally because of the display table used

**Solution Approach:**

**Phase 1: Filtering System**
I identified all attributes associated with a video and categorized them as filtering items or sort items. In collaboration with the dev team, we divided filtering and sorting into two separate phases. This allowed us to build the foundation of the new filtering system and iterate new functionality over time.

**Phase 2: Information Architecture**
- Used thumbnail area to communicate video status (Uploading, Processing, Video Missing, No Cover Image)
- Surfaced key video management functions (Publishing, Deleting)
- Separated content types as distinct sections

**Note:** Usability testing revealed the ellipses menu was difficult to find. The final design exposed functionality with icons.

---

## Create: Build the Solution

I create high-fidelity prototypes that feel real enough to test with users. My designs include annotations explaining the thinking behind key decisions.

### My Approach

I work in Figma, creating component libraries that maintain consistency while allowing flexibility. I design for the full experience - desktop, tablet, and mobile - ensuring the interaction patterns work across contexts.

### Example: Vidflex Library - Mobile Solution

**The Challenge:** The existing table layout caused horizontal scrolling on mobile devices.

**Solution:**
I designed a card format for mobile that:
- Includes all the same functionality as list view
- Sets card view as default for mobile phones and small tablets  
- Allows users to select card view or list view preference on desktop

This preserved functionality while adapting to mobile interaction patterns.

---

## Verify: Validate with Real Users

I test early and often, adjusting designs based on what I learn from real users.

### My Approach

I conduct usability testing sessions where I watch people use prototypes, noting where they struggle, what they skip, and what they find intuitive. I'm looking for moments of confusion or delight - both tell me something important.

### Example: Vidflex Library - Iteration Based on Testing

**Initial Design:**
Functions were hidden behind an ellipses menu.

**Testing Discovery:**
Users consistently had difficulty finding key functions.

**Design Adjustment:**
Exposed functionality with clear icons instead of hiding behind a menu.

**Result:**
Task completion improved and user confidence increased.

---

## The Complete Process in Action

The Vidflex Library redesign demonstrates the full USCV cycle:

**Understand** (2 weeks)
- Interviewed 5 CX Success team members
- Mapped data sources and API availability
- Identified technical constraints

**Solve** (1 week)  
- Sketched filtering approaches
- Collaborated with dev team on phased implementation
- Designed information architecture

**Create** (2 weeks)
- Built high-fidelity prototypes
- Created both list and card views
- Designed for responsive breakpoints

**Verify** (1 week)
- Conducted usability testing
- Discovered ellipses menu was problematic
- Refined design based on findings

**Customer Success created a Library Explanation Video** demonstrating the final design, which you can view at: [help.vidflex.tv](https://help.vidflex.tv/en/c/library-overview-dcff55ce.978)

---

## Key Takeaway

This USCV framework ensures I'm always solving the right problem in the right way. The Understanding Phase prevents wasted effort. The Solve Phase explores options. The Create Phase makes ideas tangible. The Verify Phase ensures the solution actually works for real people.

**This same framework applies whether I'm designing for humans or AI agents** - the principles of understanding user mental models, exploring solutions, creating tangible designs, and validating with real users remain constant.
