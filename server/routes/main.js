const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

router.get("/", async (req, res) => {
  try {
    const locals = {
      title: "Message",
      description: "Simple Message-app created with NodeJs, Express & MongoDb.",
    };

    const data = await Message.find();
    res.render("index", { locals, data, currentRoute: "/" });
  } catch (error) {
    console.log(error);
  }
});

router.get("/message/:id", async (req, res) => {
  try {
    let slug = req.params.id;
    const data = await Message.findById({ _id: slug });
    res.render("message", { data, currentRoute: `/post/${slug}` });
  } catch (error) {
    console.log(error);
  }
});

// post routes
router.post("/search", async (req, res) => {
  try {
    const locals = {
      title: "search",
      description: "testing search bar",
    };

    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");

    const data = await Message.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, "i") } },
        { body: { $regex: new RegExp(searchNoSpecialChar, "i") } },
      ],
    });
    // res.render("search", { locals, data });
    res.render("results", { data, locals });
  } catch (error) {
    console.log(error);
  }
});

router.post("/", async (req, res) => {
  try {
    const message = new Message(req.body);
    const data = await message.save();
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

router.get("/about", (req, res) => {
  res.render("about", { currentRoute: "/about" });
});

module.exports = router;

// function insertMessageData() {
// //   Message.insertMany([
// //     {
// //       title: "Building messageboard",
// //       body: "this is body text",
// //     },
// //     {
// //       title: "test",
// //       body: "this is body text",
// //     },
// //     {
// //       title: "test 2",
// //       body: "this is body text",
// //     },
// //   ]);
// // }

// // // insertMessageData();
