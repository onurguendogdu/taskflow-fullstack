import express from "express";
import { body, param, query, validationResult } from "express-validator";

const STATUSES = ["open", "doing", "done"];
const PRIORITIES = ["low", "medium", "high"];

function validationFailure(req, res, next) {
    const result = validationResult(req);
    if (result.isEmpty()) return next();

    return res.status(422).json({
        message: "Please check the submitted task data.",
        errors: result.array({ onlyFirstError: true })
    });
}

const idRules = [
    param("id").isMongoId().withMessage("Invalid task ID.")
];

const taskRules = [
    body("title")
        .isString().withMessage("Title must be text.")
        .bail().trim().isLength({ min: 3, max: 120 })
        .withMessage("Title must contain between 3 and 120 characters."),
    body("description")
        .optional({ nullable: true }).isString().bail().trim().isLength({ max: 600 })
        .withMessage("Description must not exceed 600 characters."),
    body("due")
        .isString().bail().isISO8601({ strict: true, strictSeparator: true })
        .withMessage("Due date must be a valid ISO date."),
    body("status")
        .isIn(STATUSES).withMessage("Status must be open, doing or done."),
    body("priority")
        .isIn(PRIORITIES).withMessage("Priority must be low, medium or high.")
];

const listRules = [
    query("q").optional().isString().trim().isLength({ max: 100 }),
    query("status").optional().isIn(STATUSES),
    query("priority").optional().isIn(PRIORITIES),
    query("sort").optional().isIn(["due", "createdAt", "updatedAt", "priority"]),
    query("order").optional().isIn(["asc", "desc"])
];

export default function createTaskRouter(repository) {
    const router = express.Router();

    /**
     * @openapi
     * /api/tasks:
     *   get:
     *     tags: [Tasks]
     *     summary: List the current user's tasks
     *     parameters:
     *       - in: query
     *         name: q
     *         schema: { type: string }
     *       - in: query
     *         name: status
     *         schema: { type: string, enum: [open, doing, done] }
     *       - in: query
     *         name: priority
     *         schema: { type: string, enum: [low, medium, high] }
     *     responses:
     *       '200': { description: Task list }
     */
    router.get("/", listRules, validationFailure, async (req, res, next) => {
        try {
            const tasks = await repository.list(req.user.username, {
                q: req.query.q,
                status: req.query.status,
                priority: req.query.priority,
                sort: req.query.sort,
                order: req.query.order
            });
            res.json(tasks);
        } catch (error) {
            next(error);
        }
    });

    router.get("/:id", idRules, validationFailure, async (req, res, next) => {
        try {
            const task = await repository.findById(req.params.id, req.user.username);
            if (!task) return res.status(404).json({ message: "Task not found." });
            return res.json(task);
        } catch (error) {
            return next(error);
        }
    });

    /**
     * @openapi
     * /api/tasks:
     *   post:
     *     tags: [Tasks]
     *     summary: Create a new task
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema: { $ref: '#/components/schemas/TaskInput' }
     *     responses:
     *       '201': { description: Created task }
     *       '422': { description: Validation error }
     */
    router.post("/", taskRules, validationFailure, async (req, res, next) => {
        try {
            const task = await repository.create(req.body, req.user.username);
            return res.status(201).json(task);
        } catch (error) {
            return next(error);
        }
    });

    router.put("/:id", [...idRules, ...taskRules], validationFailure, async (req, res, next) => {
        try {
            const task = await repository.update(req.params.id, req.body, req.user.username);
            if (!task) return res.status(404).json({ message: "Task not found." });
            return res.json(task);
        } catch (error) {
            return next(error);
        }
    });

    router.delete("/:id", idRules, validationFailure, async (req, res, next) => {
        try {
            const deleted = await repository.delete(req.params.id, req.user.username);
            if (!deleted) return res.status(404).json({ message: "Task not found." });
            return res.status(204).end();
        } catch (error) {
            return next(error);
        }
    });

    return router;
}
