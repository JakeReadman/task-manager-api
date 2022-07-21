const express = require("express");
const router = new express.Router();
require("../db/mongoose");
const multer = require("multer");
const auth = require("../middleware/auth");
const sharp = require("sharp");
const User = require("../models/user");

//Create new user
router.post("/users", async (req, res) => {
    const user = new User(req.body);

    try {
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

//Uplaod user avatar

const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|png|jpeg|JPG|PNG|JPEG)$/)) {
            return cb(new Error("Wrong file type"));
        }
        cb(undefined, true);
    },
});

router.post(
    "/users/me/avatar",
    auth,
    upload.single("avatar"),
    async (req, res) => {
        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
        req.user.avatar = buffer;
        await req.user.save();
        res.send();
    },
    (error, req, res, next) => {
        res.status(400).send({ error: error.message });
    }
);

//Get user's avatar
router.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            throw new Error("Oopsie doopsie");
        }
        res.set("Content-Type", "image/png");
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
});

//User login
router.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();

        res.send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

//Logout user from current device
router.post("/users/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

//Logout user from all devices
router.post("/users/logout/all", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

//Get current user details
router.get("/users/me", auth, async (req, res) => {
    res.send(req.user);
});

//Update a user
router.patch("/users/me", auth, async (req, res) => {
    const allowedUpdates = ["name", "age", "email", "password"];
    const updateData = req.body;
    const updateFields = Object.keys(updateData);

    const isValidOperation = updateFields.every((field) => allowedUpdates.includes(field));

    if (!isValidOperation) {
        return res.status(400).send({ error: "Incorrect parameters passed" });
    }

    try {
        updateFields.forEach((update) => {
            req.user[update] = updateData[update];
        });
        await req.user.save();
        res.send(req.user);
    } catch (e) {
        res.status(400).send(e);
    }
});

//Delete a user
router.delete("/users/me", auth, async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
});

//Delete a user's avatar
router.delete("/users/me/avatar", auth, async (req, res) => {
    req.user.avatar = undefined;
    req.user.save();
    res.send();
});

module.exports = router;
