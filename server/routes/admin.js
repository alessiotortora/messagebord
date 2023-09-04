const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLayout = "../views/layouts/admin";
const jwtSecret = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "unauthorized" });
  }
};

router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "admin",
      description: "admin page",
    };
    res.render("admin/index", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "admin",
      description: "admin dashboard",
    };

    const data = await Message.find();

    res.render("admin/dashboard", { locals, layout: adminLayout, data });
  } catch (error) {
    console.log(error);
  }
});

router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status((401).json({ message: "invalid credentials" }));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status((401).json({ message: "invalid credentials" }));
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });

    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

//add new post
router.get("/add-message", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add message",
      description: "admin dashboard",
    };

    const data = await Message.find();

    res.render("admin/add-message", { locals, layout: adminLayout, data });
  } catch (error) {
    console.log(error);
  }
});

router.post("/add-message", authMiddleware, async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

//edit message
router.put("/edit-message/:id", authMiddleware, async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now(),
    });

    res.redirect(`/dashboard`);
  } catch (error) {
    console.log(error);
  }
});

router.get("/edit-message/:id", authMiddleware, async (req, res) => {
  try {
    const data = await Message.findOne({ _id: req.params.id });

    res.render("admin/edit-message", { layout: adminLayout, data });
  } catch (error) {
    console.log(error);
  }
});

//delete message
router.delete("/delete-message/:id", authMiddleware, async (req, res) => {
  try {
    await Message.deleteOne({ _id: req.params.id });

    res.redirect(`/dashboard`);
  } catch (error) {
    console.log(error);
  }
});

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username, password: hashedPassword });
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ message: "User already exist" });
      }
      res.status(500).json({ message: "internal server error" });
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/logout", async (req, res) => {
  res.clearCookie("token");
  //res.json({ message: "logout succes" });
  res.redirect("/admin");
});

module.exports = router;
