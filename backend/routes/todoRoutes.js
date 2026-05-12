const express = require("express");

const router = express.Router();

const Todo = require("../models/Todo");



router.post("/addTodo", async (req, res) => {

    const todo = new Todo({

        title: req.body.title

    });

    await todo.save();

    res.send("Todo Added");

});



router.get("/getTodos", async (req, res) => {

    const todos = await Todo.find();

    res.json(todos);

});



router.delete("/deleteTodo/:id", async (req, res) => {

    await Todo.findByIdAndDelete(req.params.id);

    res.send("Todo Deleted");

});



router.put("/updateTodo/:id", async (req, res) => {

    await Todo.findByIdAndUpdate(

        req.params.id,

        {
            completed: req.body.completed
        }

    );

    res.send("Todo Updated");

});



module.exports = router;