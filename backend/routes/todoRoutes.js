const express = require("express");
const router = express.Router();
const Todo = require("../models/Todo");

router.get("/", async (req, res) => {
    const todos = await Todo.find();
    res.json(todos);
});

router.post("/", async (req, res) => {
    const todo = new Todo({
        title: req.body.title
    });

    const savedTodo = await todo.save();
    res.json(savedTodo);
});

router.put("/:id", async (req, res) => {

    try {

        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            {
                completed: req.body.completed
            },
            {
                new: true
            }
        );

        res.json(updatedTodo);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});

router.delete("/:id", async (req, res) => {
    await Todo.findByIdAndDelete(req.params.id);

    res.json({
        message: "Deleted"
    });
});

module.exports = router;
