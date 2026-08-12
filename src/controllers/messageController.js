import Message from '../models/Message.js';

// @desc    Send / Save new message - PUBLIC
export const sendMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ success: false, msg: "All fields are required" });
    }

    const newMessage = await Message.create({ name, email, phone, subject, message });

    res.status(201).json({
      success: true,
      msg: "Message sent successfully!",
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Server Error", error: error.message });
  }
};

// @desc    Get all messages - PROTECTED
export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

// @desc    Get single message - PROTECTED
export const getSingleMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, msg: "Message not found" });
    }
    res.status(200).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

// @desc    Delete a message - PROTECTED
export const deleteMessage = async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, msg: "Message deleted" });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};