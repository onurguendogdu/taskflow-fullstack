# Architecture

```mermaid
flowchart LR
    Browser[Browser / ES Modules] -->|REST / JSON| Express[Express API]
    Express --> Auth[Demo Auth or OIDC/JWT]
    Express --> Routes[Task Routes + Validation]
    Routes --> Repository[Task Repository]
    Repository --> MongoDB[(MongoDB)]
    Express --> Swagger[OpenAPI / Swagger UI]
```

## Design Decisions

### Repository Layer

The HTTP routes do not depend on MongoDB-specific implementation details.

This allows the persistence layer to be replaced and enables the API to be tested using an in-memory repository without requiring a running MongoDB instance.

### Authentication Modes

The `demo` mode allows the application to run locally without an external identity provider.

For external authentication, `AUTH_MODE=oidc` can be used. OIDC endpoints and credentials are provided exclusively through environment variables.

### Framework-Free Frontend

The frontend intentionally uses native browser ES Modules with HTML, CSS, and JavaScript.

API access and UI rendering are separated, which makes it possible to migrate the frontend to a framework such as React in the future without changing the REST API.
