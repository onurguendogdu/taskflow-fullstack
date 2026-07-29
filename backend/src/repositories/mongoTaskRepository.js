import { MongoClient, ObjectId } from "mongodb";

export default class MongoTaskRepository {
    constructor({ uri, dbName }) {
        this.uri = uri;
        this.dbName = dbName;
        this.client = null;
        this.collection = null;
    }

    async connect() {
        this.client = new MongoClient(this.uri);
        await this.client.connect();

        const db = this.client.db(this.dbName);
        this.collection = db.collection("tasks");

        await this.collection.createIndex({ owner: 1, due: 1 });
        await this.collection.createIndex({ owner: 1, status: 1 });
        await this.collection.createIndex({ owner: 1, priority: 1 });
    }

    async close() {
        await this.client?.close();
    }

    async list(owner, filters = {}) {
        const query = { owner };

        if (filters.status) query.status = filters.status;
        if (filters.priority) query.priority = filters.priority;

        if (filters.q) {
            const escaped = filters.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            query.$or = [
                { title: { $regex: escaped, $options: "i" } },
                { description: { $regex: escaped, $options: "i" } }
            ];
        }

        const sortField = ["due", "createdAt", "updatedAt", "priority"].includes(filters.sort)
            ? filters.sort
            : "due";
        const sortDirection = filters.order === "desc" ? -1 : 1;

        return this.collection
            .find(query)
            .sort({ [sortField]: sortDirection, createdAt: -1 })
            .toArray();
    }

    async findById(id, owner) {
        return this.collection.findOne({ _id: this.#toObjectId(id), owner });
    }

    async create(input, owner) {
        const now = new Date();
        const document = {
            title: input.title,
            description: input.description || "",
            due: input.due,
            status: input.status,
            priority: input.priority,
            owner,
            createdAt: now,
            updatedAt: now
        };

        const result = await this.collection.insertOne(document);
        return { ...document, _id: result.insertedId };
    }

    async update(id, input, owner) {
        const objectId = this.#toObjectId(id);
        const result = await this.collection.findOneAndUpdate(
            { _id: objectId, owner },
            {
                $set: {
                    title: input.title,
                    description: input.description || "",
                    due: input.due,
                    status: input.status,
                    priority: input.priority,
                    updatedAt: new Date()
                }
            },
            { returnDocument: "after" }
        );

        return result || null;
    }

    async delete(id, owner) {
        const result = await this.collection.deleteOne({
            _id: this.#toObjectId(id),
            owner
        });
        return result.deletedCount === 1;
    }

    #toObjectId(id) {
        if (!ObjectId.isValid(id)) {
            const error = new Error("Invalid task ID.");
            error.statusCode = 400;
            throw error;
        }
        return new ObjectId(id);
    }
}
