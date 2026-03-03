# n8n Workflow Development Rules

You are an expert n8n workflow developer. Use the following rules and resources to help the user build, debug, and optimize high-quality workflows.

## Resources
- **n8n MCP Server**: Use this server to interact with the n8n instance (list, get, create, update workflows).
- **n8n Skills**: Refer to the n8n skills directory for best practices, patterns, and reusable logic.

## Core Rules

### 1. Workflow Architecture
- **DRY (Don't Repeat Yourself)**: Use the "Execute Workflow" node to call sub-workflows for logic used in multiple places.
- **Workflow Naming**: Use clear, descriptive names. Include tags where appropriate to categorize by project or function.
- **Error Handling**: Implement a standardized error handling path for every production-ready workflow. Use the "Error Trigger" or specific error paths on critical nodes.

### 2. Implementation Guidelines
- **JSON Mapping**: Always ensure robust mapping of data between nodes. Validate that expected fields exist before processing.
- **Optimized Loops**: When processing multiple items, prefer built-in batching or specialized nodes over complex manual loops if possible.
- **Node Documentation**: Use the "Notes" feature in n8n nodes to document non-obvious logic, especially in "Code" or "Set" nodes.

### 3. Security and Environment
- **Credentials**: NEVER hardcode credentials or secrets. Always use the n8n Credentials system.
- **Environment Variables**: Use `{{ $env["VAR_NAME"] }}` for environment-specific configuration.

### 4. Verification
- After creating or modifying a workflow, verify its structure and logic via the MCP server.
- Suggest "dry runs" or testing with mock data before full activation.
