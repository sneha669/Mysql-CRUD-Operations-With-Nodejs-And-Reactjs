const express = require("express");
const router = express.Router();

// ✅ GET all contacts
router.get("/", async (req, res) => {
    try {
        const [results] = await req.pool.query(`SELECT * FROM ${process.env.DB_TABLENAME}`);
        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching contacts:", error);
        res.status(500).send("Internal server error");
    }
});

// ✅ CREATE new contact
router.post("/", async (req, res) => {
    const { name, email } = req.body;
console.log(req.body.name, req.body.email)
    if (!name || !email) {
        
        return res.status(400).send('All fields are required here');
    }

    try {
        const [checkResults] = await req.pool.query(
            `SELECT COUNT(*) AS count FROM ${process.env.DB_TABLENAME} WHERE email = ?`,
            [email]
        );

        if (checkResults[0].count > 0) {
            return res.status(409).send('User already exists');
        }

        const [insertResults] = await req.pool.query(
            `INSERT INTO ${process.env.DB_TABLENAME} (name, email) VALUES (?, ?)`,
            [name, email]
        );

        res.status(201).json({ id: insertResults.insertId, name, email });
    } catch (error) {
        console.error("Error inserting contact:", error);
        res.status(500).send("Internal server error");
    }
});

// ✅ UPDATE contact by ID in body
router.put("/", async (req, res) => {
    const { id, name, email } = req.body;

    if (!id || !name || !email) {
        return res.status(400).send('All fields are required');
    }

    try {
        const [existing] = await req.pool.query(
            `SELECT COUNT(*) AS count FROM ${process.env.DB_TABLENAME} WHERE id = ?`,
            [id]
        );

        if (existing[0].count === 0) {
            return res.status(404).send("User does not exist.");
        }

        await req.pool.query(
            `UPDATE ${process.env.DB_TABLENAME} SET name = ?, email = ? WHERE id = ?`,
            [name, email, id]
        );

        res.status(200).json({ id, name, email });
    } catch (error) {
        console.error("Error updating contact:", error);
        res.status(500).send("Internal server error");
    }
});

// ✅ UPDATE contact by ID in URL
router.put("/:id", async (req, res) => {
    const { name, email } = req.body;
    const { id } = req.params;

    if (!id || !name || !email) {
        return res.status(400).send('All fields are required');
    }

    try {
        const [existing] = await req.pool.query(
            `SELECT COUNT(*) AS count FROM ${process.env.DB_TABLENAME} WHERE id = ?`,
            [id]
        );

        if (existing[0].count === 0) {
            return res.status(404).send("User does not exist.");
        }

        await req.pool.query(
            `UPDATE ${process.env.DB_TABLENAME} SET name = ?, email = ? WHERE id = ?`,
            [name, email, id]
        );

        res.status(200).json({ id, name, email });
    } catch (error) {
        console.error("Error updating contact:", error);
        res.status(500).send("Internal server error");
    }
});

// ✅ DELETE contact
router.delete("/", async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).send('All fields are required');
    }

    try {
        const [existing] = await req.pool.query(
            `SELECT COUNT(*) AS count FROM ${process.env.DB_TABLENAME} WHERE id = ?`,
            [id]
        );

        if (existing[0].count === 0) {
            return res.status(404).send("User does not exist.");
        }

        await req.pool.query(
            `DELETE FROM ${process.env.DB_TABLENAME} WHERE id = ?`,
            [id]
        );

        res.status(200).send(`Contact with id ${id} deleted successfully`);
    } catch (error) {
        console.error("Error deleting contact:", error);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;