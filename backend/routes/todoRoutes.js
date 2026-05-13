const express = require("express");
const router = express.Router();
const Todo = require("../models/Todo");

router.get("/", async (req, res) => {
    try {
        const todos = await Todo.find();
        res.json(todos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const newTodo = new Todo({
            task: req.body.task
        });

        const savedTodo = await newTodo.save();
        res.json(savedTodo);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedTodo);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await Todo.findByIdAndDelete(req.params.id);

        res.json({
            message: "Todo Deleted"
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
