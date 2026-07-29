export function createOpenApi(port) {
    return {
        openapi: "3.0.0",
        info: {
            title: "TaskFlow API",
            version: "2.0.0",
            description: "REST API for the TaskFlow full-stack task management application."
        },
        servers: [{ url: `http://localhost:${port}` }],
        tags: [{ name: "Tasks", description: "Manage personal tasks" }],
        paths: {
            "/api/tasks": {
                get: {
                    tags: ["Tasks"],
                    summary: "List the current user's tasks",
                    parameters: [
                        { in: "query", name: "q", schema: { type: "string" } },
                        { in: "query", name: "status", schema: { type: "string", enum: ["open", "doing", "done"] } },
                        { in: "query", name: "priority", schema: { type: "string", enum: ["low", "medium", "high"] } }
                    ],
                    responses: { "200": { description: "Task list" } }
                },
                post: {
                    tags: ["Tasks"],
                    summary: "Create a new task",
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/TaskInput" } } }
                    },
                    responses: {
                        "201": { description: "Created task" },
                        "422": { description: "Validation error" }
                    }
                }
            },
            "/api/tasks/{id}": {
                get: {
                    tags: ["Tasks"],
                    summary: "Get a task by ID",
                    parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
                    responses: { "200": { description: "Task" }, "404": { description: "Task not found" } }
                },
                put: {
                    tags: ["Tasks"],
                    summary: "Update a task",
                    parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/TaskInput" } } }
                    },
                    responses: { "200": { description: "Updated task" }, "404": { description: "Task not found" } }
                },
                delete: {
                    tags: ["Tasks"],
                    summary: "Delete a task",
                    parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
                    responses: { "204": { description: "Task deleted" }, "404": { description: "Task not found" } }
                }
            }
        },
        components: {
            schemas: {
                TaskInput: {
                    type: "object",
                    required: ["title", "due", "status", "priority"],
                    properties: {
                        title: { type: "string", minLength: 3, maxLength: 120, example: "Prepare portfolio project" },
                        description: { type: "string", maxLength: 600, example: "Review README and API docs" },
                        due: { type: "string", format: "date-time", example: "2026-08-10T18:00:00.000Z" },
                        status: { type: "string", enum: ["open", "doing", "done"], example: "doing" },
                        priority: { type: "string", enum: ["low", "medium", "high"], example: "high" }
                    }
                }
            }
        }
    };
}
