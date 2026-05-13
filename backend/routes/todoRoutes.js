const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json([
        { task: "Test Task" }
    ]);
});

module.exports = router;
