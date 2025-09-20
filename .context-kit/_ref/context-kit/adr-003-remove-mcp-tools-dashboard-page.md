# ADR-003: Remove MCP Tools Page from Dashboard

## Status
**Accepted** - January 20, 2025

## Context

The TKR Context Kit dashboard was initially designed with five main views:
- Overview
- Services
- Knowledge Graph
- Logs
- MCP Tools

The MCP Tools page was intended to provide a human-friendly interface for executing Model Context Protocol tools that AI agents use programmatically. This would have included tools for:
- Log querying and analysis
- Service health monitoring
- Error trend analysis
- Database operations

However, upon review of the project's goals and user needs, several factors led to reconsidering this design:

1. **Target Audience Mismatch**: The dashboard is primarily intended for monitoring and observability, not for manual tool execution
2. **Redundant Functionality**: The logging tools already have dedicated UI in the Logs view with filtering, search, and real-time monitoring
3. **Complexity vs. Value**: Implementing a generic tool execution interface adds significant complexity for limited practical benefit
4. **AI-First Design**: MCP tools are specifically designed for AI agent interaction, not human use
5. **Maintenance Overhead**: Maintaining dual interfaces (AI tools + human UI) creates unnecessary complexity

## Decision

**Remove the MCP Tools page from the dashboard entirely.**

This includes:
- Removing the MCPTool TypeScript interface
- Removing the MCPToolCard component
- Removing the tools navigation item
- Removing tools-related props and state management
- Removing sample tools data
- Cleaning up unused imports

## Consequences

### Positive
- **Simplified Architecture**: Reduced complexity in dashboard codebase
- **Focused Purpose**: Dashboard maintains clear focus on monitoring and observability
- **Reduced Maintenance**: No need to maintain dual interfaces for the same functionality
- **Better User Experience**: Users get specialized, purpose-built interfaces rather than generic tool executors
- **Cleaner Navigation**: Four focused views instead of five with unclear purpose

### Negative
- **No Direct Tool Access**: Users cannot manually execute MCP tools through the dashboard
- **Potential Future Need**: If manual tool execution becomes necessary, would require re-implementation

### Mitigation
- MCP tools remain fully functional for AI agents through the MCP server
- Logging functionality is comprehensively covered by the dedicated Logs view
- Service monitoring is handled by the Services view
- Future manual tool needs can be addressed through specialized interfaces if required

## Implementation

The removal was implemented by:
1. Removing all MCP tool-related TypeScript interfaces and components
2. Updating the navigation array to exclude the tools view
3. Cleaning up component props and state management
4. Removing unused icon imports (Wrench, Play)
5. Updating the DashboardProps interface

## Alternatives Considered

1. **Keep but Simplify**: Reduce the scope of the MCP Tools page to only essential tools
   - Rejected: Still adds complexity without clear value proposition

2. **Admin-Only Access**: Hide the tools page behind admin permissions
   - Rejected: Doesn't address the fundamental mismatch of purpose

3. **Developer Mode**: Show tools page only in development builds
   - Rejected: Creates inconsistent user experience across environments

## Related Decisions

- This decision aligns with the overall architecture focus on specialized, purpose-built interfaces
- Supports the AI-first design philosophy where tools are optimized for programmatic access
- Maintains the service-oriented architecture without unnecessary UI coupling

## References

- Original dashboard implementation: `.context-kit/dashboard/src/App.tsx`
- MCP logging tools implementation: `.context-kit/mcp/src/tools/logging.ts`
- Dashboard architecture documentation: `.context-kit/_context-kit.yml`