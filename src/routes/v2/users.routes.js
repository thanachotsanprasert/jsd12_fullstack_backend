import { Router } from "express";

import { users } from "../../fakeData/fakeUsers.js";

export const router = Router();

router.get("/", (req, res) => {
    res.json(users);
});

router.post("/", (req, res) => {
    const { username, email } = req.body || {};

    if (!username || !email) {
        return res
            .status(400)
            .json({ error: "username and email are required" });
    }

    const nextID = String(
        (users.reduce((max, u) => Math.max(max, Number(u.id)), 0) || 0) + 1,
    );

    const newUser = { id: nextID, username, email };
    users.push(newUser);
    return res.status(201).json(newUser);
});

router.put("/:id", (req, res) => {
    const user = users.find((u) => u.id === String(req.params.id));

    if (!user) {
        return res.status(404).json({ error: "not found" });
    }

    const { username, email, password } = req.body || {};

    if (!username || !email || !password) {
        return res
            .status(400)
            .json({ error: "username, email and password are require!" });
    }

    user.username = username;
    user.email = email;
    user.password = password;

    return res.status(200).json(user);
});

router.delete("/:id", (req, res) => {
    const userIndex = users.findIndex((u) => u.id === String(req.params.id));

    if (userIndex === -1) {
        return res.status(404).json({ error: "not found" });
    }

    const deletedUser = users.splice(userIndex, 1)[0];

    return res.status(200).json(deletedUser);
});
