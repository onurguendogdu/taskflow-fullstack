import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { afterEach, beforeEach, describe, it } from "node:test";

import { createApp } from "../src/app.js";

class MemoryTaskRepository {
    constructor() {
        this.tasks = [];
    }

    async list(owner, filters = {}) {
        return this.tasks.filter((task) => {
            if (task.owner !== owner) return false;
            if (filters.status && task.status !== filters.status) return false;
            if (filters.priority && task.priority !== filters.priority) return false;
            if (filters.q) {
                const haystack = `${task.title} ${task.description}`.toLowerCase();
                if (!haystack.includes(filters.q.toLowerCase())) return false;
            }
            return true;
        });
    }

    async findById(id, owner) {
        return this.tasks.find((task) => task._id === id && task.owner === owner) || null;
    }

    async create(input, owner) {
        const now = new Date();
        const task = {
            ...input,
            _id: randomBytes(12).toString("hex"),
            owner,
            createdAt: now,
            updatedAt: now
        };
        this.tasks.push(task);
        return task;
    }

    async update(id, input, owner) {
        const index = this.tasks.findIndex((task) => task._id === id && task.owner === owner);
        if (index < 0) return null;
        this.tasks[index] = { ...this.tasks[index], ...input, updatedAt: new Date() };
        return this.tasks[index];
    }

    async delete(id, owner) {
        const before = this.tasks.length;
        this.tasks = this.tasks.filter((task) => !(task._id === id && task.owner === owner));
        return this.tasks.length < before;
    }
}

const config = {
    port: 3000,
    authMode: "demo",
    demoUser: "test-user",
    oidc: null
};

let server;
let baseUrl;
let repository;

beforeEach(async () => {
    repository = new MemoryTaskRepository();
    const app = createApp({ repository, config });
    server = app.listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
});

afterEach(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
});

async function jsonRequest(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, options);
    const body = response.status === 204 ? null : await response.json();
    return { response, body };
}

describe("TaskFlow API", () => {
    it("reports service health", async () => {
        const { response, body } = await jsonRequest("/health");
        assert.equal(response.status, 200);
        assert.equal(body.status, "ok");
    });

    it("serves the TaskFlow frontend", async () => {
        const response = await fetch(`${baseUrl}/`);
        const html = await response.text();
        assert.equal(response.status, 200);
        assert.match(html, /TaskFlow/);
    });

    it("creates, updates and deletes a task", async () => {
        const input = {
            title: "Prepare portfolio project",
            description: "Clean up the repository and documentation.",
            due: "2026-08-10T18:00:00.000Z",
            status: "open",
            priority: "high"
        };

        const created = await jsonRequest("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input)
        });
        assert.equal(created.response.status, 201);
        assert.equal(created.body.owner, "test-user");
        assert.equal(created.body.title, input.title);

        const id = created.body._id;
        const updated = await jsonRequest(`/api/tasks/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...input, status: "doing" })
        });
        assert.equal(updated.response.status, 200);
        assert.equal(updated.body.status, "doing");

        const removed = await fetch(`${baseUrl}/api/tasks/${id}`, { method: "DELETE" });
        assert.equal(removed.status, 204);

        const missing = await jsonRequest(`/api/tasks/${id}`);
        assert.equal(missing.response.status, 404);
    });

    it("rejects invalid task data", async () => {
        const { response, body } = await jsonRequest("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: "x",
                due: "not-a-date",
                status: "later",
                priority: "urgent"
            })
        });

        assert.equal(response.status, 422);
        assert.ok(body.errors.length > 0);
    });

    it("filters tasks by status and search query", async () => {
        await repository.create({
            title: "Build Node API",
            description: "Express backend",
            due: "2026-08-10T18:00:00.000Z",
            status: "doing",
            priority: "high"
        }, "test-user");
        await repository.create({
            title: "Write README",
            description: "GitHub documentation",
            due: "2026-08-11T18:00:00.000Z",
            status: "done",
            priority: "medium"
        }, "test-user");

        const { response, body } = await jsonRequest("/api/tasks?status=doing&q=node");
        assert.equal(response.status, 200);
        assert.equal(body.length, 1);
        assert.equal(body[0].title, "Build Node API");
    });
});
