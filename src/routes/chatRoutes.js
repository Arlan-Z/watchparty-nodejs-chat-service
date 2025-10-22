import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

router.get("/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to get messages" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { senderId, content, roomId } = req.body;
    const msg = new Message({ senderId, content, roomId });
    await msg.save();
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;