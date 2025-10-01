# Context Kit: Designing for AI Agent Experience (AGx)

## The Problem

I created tkr-context-kit to solve a fundamental problem I was experiencing with AI agents: they were spending too much time in every conversation relearning my project structure and functionality. I watched Claude spend 8-12 seconds searching for component files, reading documentation, and mapping out relationships that hadn't changed since our last conversation.

I realized I needed to design a system that would give agents comprehensive context upfront, allowing them to focus on the actual work rather than constantly re-discovering what my modules do or how my components are structured.

**The core insight:** AI agents have fundamentally different information processing needs than humans. They can consume thousands of lines of structured data instantly, but they waste time navigating file systems and re-reading code they've already analyzed.

---

## What is AGx Design?

AGx - Agent Experience design - applies traditional UX principles to designing systems for AI agent consumption and interaction.

Just as UX designers conduct user research with humans to understand mental models and interaction patterns, I conduct "user research" with AI agents. I ask them what they need to better understand certain contexts, what's missing, what's redundant, and what isn't required.

**Key AGx Principles:**

1. **Understand Agent Cognition** - How do AI agents actually process and utilize contextual information?
2. **Design for Efficiency** - Reduce token consumption and eliminate repetitive exploration
3. **Enable Progressive Disclosure** - Let agents consume information at whatever detail level they need
4. **Maintain Human Accessibility** - Humans must still be able to read and maintain the system

---

## The Solution: _project.yml

The breakthrough came when I developed the `_project.yml` file structure. This became the core of everything - a comprehensive context map that gives AI agents immediate understanding of my project's architecture, design tokens, component relationships, and operational patterns.

### Why YAML?

The YAML format itself came from conversations with AI agents where we discussed the pros and cons of YAML versus JSON versus Mermaid for agent consumption. The agents preferred YAML's hierarchical structure and semantic anchors for quick context parsing.

**What agents told me:**
- "YAML's semantic anchors let me reference concepts without repeating data"
- "The hierarchical structure mirrors how I think about project organization"
- "Comments and inline documentation help me understand intent, not just structure"

### The Evolution: 1000 Lines → 300 Lines

My initial `_context-kit.yml` was nearly 1000 lines. Through iterative conversations with agents about what they actually used, I optimized it down to ~300 lines while maintaining (and actually improving) information density.

**How I achieved 70% reduction:**

**Semantic Anchors**
I noticed agents would often repeat similar context patterns, so the anchor system lets me define something like `&tech-stack` once and reference it multiple times without bloating the token count.

```yaml
meta:
  stack: &tech-stack "React 19 + Vite + Tailwind + Storybook"
  
build:
  stack: *tech-stack
  
deploy:
  requirements: *tech-stack
```

**Semantic Definitions**
By explicitly defining terms like `~service_oriented` and `~graceful_degradation`, I give agents a shared vocabulary that stays consistent across conversations.

```yaml
semantic:
  service_oriented: &service_oriented
    desc: "Modular services that can be enabled/disabled independently"
    pattern: "Service registry with base service abstraction"
    
  graceful_degradation: &graceful_degradation
    desc: "System continues functioning when components fail"
    pattern: "Mock data fallbacks + health monitoring"
```

**Progressive Context Disclosure**
I structured the YAML so agents can consume context at whatever level of detail they need. Sometimes they just need the high-level meta information to understand what kind of project they're working with. Other times they need to dive deep into the ops patterns to understand how to actually execute tasks.

```yaml
meta:
  kit: tkr-context-kit
  type: development-toolkit
  desc: "Brief project overview here"
  
# Quick reference level
struct:
  services: {n: 4, desc: "Dashboard, API, Logger, MCP"}
  
# Detailed level (when agents need it)
services:
  dashboard:
    port: 42001
    tech: "React 19 + Vite"
    purpose: "Unified interface for toolkit"
    depends_on: [api, logger]
```

---

## User Research with AI Agents

This is where AGx design gets interesting. I regularly ask my AI agents:
- "What context would help you understand this better?"
- "What information in the YAML do you actually use?"
- "What's missing that you keep having to search for?"
- "Is this organization logical for how you process information?"

### Concrete Example: The YAML vs JSON Discussion

**Me:** "Would JSON be better than YAML for the context file?"

**Claude:** "YAML has advantages for context files. The semantic anchors (`&anchor` and `*reference`) let me see relationships without reading the same content multiple times. JSON would require full duplication or complex referencing. The hierarchical indentation also helps me quickly scan structure levels."

**Design Decision:** Stuck with YAML, but added inline comments explaining architectural decisions since agents told me this helped them understand *why* not just *what*.

### Example: Discovering Progressive Disclosure Need

**Me:** "Do you use all the detail in the services section every time?"

**Claude:** "No. Usually I scan the meta and struct sections first to build a mental model. I only dive into detailed service specs when working on that specific service. The two-tier structure (overview + detail) is efficient."

**Design Decision:** Restructured to have lightweight references at top level, detailed specs in dedicated sections. Agents can now scan efficiently and drill down only when needed.

---

## The Architecture: Service-Oriented Design

I chose a service-oriented architecture specifically to enable modularity - I wanted the ability to easily enable or disable parts of the kit rather than managing a monolithic application.

### Core Services

**Unified React Dashboard** (port 42001)
- Aggregates all toolkit functionality
- Visual interface for humans
- Real-time service health monitoring

**Knowledge Graph Backend API** (port 42003)
- SQLite + FTS5 storage
- Entity and relationship management
- Enables agents to query component relationships without traversing files

**Centralized Logging Service**
- Structured output for debugging
- Agents can reference logs to understand system behavior

**MCP (Model Context Protocol) Integration**
- Persistent AI memory
- Context automatically loaded in every conversation
- No more re-exploration of project structure

---

## Agent Specialization Strategy

I've developed 11 specialized Claude Code agents for automated tasks. Each agent has a distinct role and "personality" optimized for its function:

**Parallel Agent Example: context-init**

The context-init agent uses parallel agents to update different parts of the kit simultaneously:
1. **Component Analyzer** - Updates knowledge graph with new components
2. **Documentation Agent** - Refreshes claude.local.md documentation  
3. **Structure Agent** - Maintains _project.yaml structure

Each agent saves their analysis to individual markdown files. Then a **Consolidation Agent** reviews all reports and makes the required updates to the context files.

**Why Parallel?**
Sequential analysis of 33 components would take 8-10 minutes. Parallel analysis completes in 2-3 minutes.

---

## Dual Interface Philosophy

The knowledge graph demonstrates a key AGx principle: **same data, different interfaces optimized for different users**.

**For AI Agents:**
- Query via MCP: "What components use the useState hook?"
- Get structured JSON response
- Access relationship graph without file traversal

**For Humans:**
- Visual React dashboard
- Interactive graph visualization with ReactFlow
- Click to explore component relationships

Both users get the same information, but through interfaces optimized for their interaction patterns.

---

## The Workflow Integration

Context updating is now part of my commit commands, so the system stays current without me having to think about it.

```bash
# My commit workflow
git add .
npm run update-context  # Agents analyze changes, update YAML
git commit -m "feat: new component"
```

The _ref and _spec directories serve as documentation specifically designed for AI consumption, while humans interact with the system through markdown files that remain readable and maintainable.

---

## Real Impact: Before and After

### Before tkr-context-kit

**Typical conversation start:**

**Me:** "Can you help me add a new slide component?"

**Claude:** "I'll need to explore your project structure first."
- *[8 seconds searching for component files]*
- *[12 seconds reading existing slides]*
- *[6 seconds checking imports and dependencies]*

**Claude:** "I see you have 18 HTML slides in src/components/html-slides..."

**Token cost:** ~3,200 tokens
**Time:** 26+ seconds

### After tkr-context-kit

**Typical conversation start:**

**Me:** "Can you help me add a new slide component?"

**Claude:** "Looking at your project structure from _project.yml, you have 18 HTML slides. New slides should follow the pattern in html-slides/index.js. What type of slide do you want to create?"

**Token cost:** ~800 tokens  
**Time:** 2-3 seconds

**Result:** 75% token reduction, 90% time reduction, agent immediately context-aware.

---

## Key Lessons from AGx Design

### 1. Agents Are Users Too
They have preferences, limitations, and optimal interaction patterns. Treat agent experience design with the same rigor as human UX design.

### 2. Token Efficiency Matters
Every repeated exploration is wasted tokens. Context systems should eliminate repetitive work while maintaining comprehensiveness.

### 3. Semantic Compression Works
Using anchors, references, and shared vocabulary dramatically reduces content size without losing information density.

### 4. Progressive Disclosure Applies
Agents don't need all information all the time. Structure context so they can scan efficiently and dive deep only when needed.

### 5. Iteration with Agent Feedback
Ask agents what works and what doesn't. They'll tell you exactly what information helps them and what's just noise.

### 6. Dual Interfaces Are Powerful
Designing different interaction modes for the same data lets each user type work in their optimal pattern.

---

## Looking Forward

I'm particularly excited about developing a **history system** for recurring bugs and their solutions, plus architectural changes and their reasoning. This would allow agents to create more thorough refactoring and debugging plans based on what has actually worked in my codebase before.

If I were to start over, I wouldn't change much about the core structure or functionality. I'd focus on streamlining and tightening the interactions and interfaces, but the fundamental approach of designing primarily for AI agent efficiency while maintaining human accessibility has proven effective.

---

## The Bigger Picture

This toolkit represents my exploration of how humans and AI can collaborate more effectively when we design the context and interfaces specifically for that collaboration.

**What excites me most:** We're at the beginning of understanding how to design for AI agent experience. The principles I'm discovering through tkr-context-kit - semantic compression, progressive disclosure, dual interfaces, agent feedback loops - these will become foundational patterns as more designers start thinking about AGx.

**The future I see:** Just as we have established UX patterns for humans (navigation, forms, feedback), we'll develop established AGx patterns for agents (context architecture, query interfaces, orchestration systems). I'm working to define what those patterns look like.
