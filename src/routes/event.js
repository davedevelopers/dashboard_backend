const router = require("express").Router();
const auth = require("../middlewares/auth");
const Event = require("../models/event");

// POST Create Event by a club
router.post("/events/create", auth, async (req, res) => {
  const event = new Event({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await event.save();
    res.status(201).send(event);
  } catch (e) {
    res.status(400).send(e);
  }
});

// GET Single Event
router.get("/events/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const event = await Event.findOne({ _id });
    if (!event) {
      return res.status(404).send();
    }
    res.send(event);
  } catch (e) {
    res.status(500).send();
  }
});

// Update Single Event
router.patch("/events/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["completed", "description"];
  const isValidUpdate = updates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (!isValidUpdate) {
    return res.status(400).send({ error: "Not a valid update" });
  }
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    //const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators: true });

    if (!task) {
      return task.status(404).send();
    }
    updates.forEach((update) => {
      return (event[update] = req.body[update]);
    });
    await event.save();

    res.send(event);
  } catch (e) {
    res.status(500).send();
  }
});

// DELETE single Event
router.delete("/events/:id", auth, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    // const task = await Task.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).send();
    }
    res.send(event);
  } catch (e) {
    res.status(500).send();
  }
});

// Registering Attendees
router.post("/events/:id/register", async (req, res) => {
  try {
    const _id = req.params.id;
    const event = await Event.findById(_id);
    event.attendees = event.attendees.concat(req.body);
    await event.save();
    res.send(event);
  } catch (err) {
    res.status(400).send();
  }
});

module.exports = router;
