const router = require("express").Router();
const User = require("../models/user");
const multer = require("multer");
const auth = require("../middlewares/auth");

const logo = multer({
  limits: {
    fileSize: 5000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error("Please upload a png or jpg file only."));
    }

    cb(undefined, true);
  },
});

// Logo and Banner
router.post(
  "/clubs/signup/logo",
  auth,
  logo.single("logo"),
  async (req, res) => {
    req.user.logo = req.file.buffer;
    await req.user.save();
    res.send();
  },
  (err, req, res, next) => {
    res.status(400).send({ error: err.message });
  }
);

// Delete Logo
router.delete("/clubs/signup/logo", auth, async (req, res) => {
  req.user.logo = undefined;
  await req.user.save();
  res.send();
});

// SignUp Club
router.post("/clubs/signup", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

// Login Club
router.post("/clubs/login", async (req, res) => {
  try {
    const user = await User.findByCredential(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user: user.getPublicProfile(), token });
  } catch (e) {
    res.status(400).send();
  }
});

// Logout Club
router.post("/clubs/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// Logout All
router.post("/clubs/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

//Get All Clubs
router.get("/clubs/all", async (req, res) => {
  try {
    const clubs = await User.find({});
    if (clubs.length === 0) {
      return res.status(404).send("No Clubs are registered");
    }
    res.send({ clubs });
  } catch (err) {
    res.status(400).send();
  }
});

// Club Profile Page
router.get("/clubs/me", auth, async (req, res) => {
  res.send(req.user.getPublicProfile());
});

// Update Club
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "password", "age", "email"];
  const isValidUpdates = updates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (!isValidUpdates) {
    return res.status(400).send({ error: "Not a valid update" });
  }

  try {
    updates.forEach((update) => {
      return (req.user[update] = req.body[update]);
    });
    await req.user.save();
    //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.send(req.user);
  } catch (error) {
    res.status(500).send();
  }
});

//Remove Club
router.delete("/users/me", auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);

    // if(!user){
    //     return res.status(404).send()
    // }

    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    return res.status(500).send();
  }
});

// Single Club
router.get("/clubs/:id", async (req, res) => {
  try {
    const club = await User.findById(req.params.id);
    if (!club) {
      return res.status(404).send();
    }
    res.send(club.getPublicProfile());
  } catch (err) {
    res.status(400).send();
  }
});

// GET Club members
router.get("/clubs/me/members", auth, async (req, res) => {
  try {
    const teacher = req.user.teacher;
    const secretary = req.user.secretary;
    const subSec = req.user.subSec;

    res.send({ teacher, secretary, subSec });
  } catch (err) {
    res.status(400).send();
  }
});

module.exports = router;
