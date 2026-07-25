import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { uploadChatMedia, hasImageKitConfig } from "../lib/imageKit.js";
import { getReceiverSocketId, io } from "../lib/socket.io.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUser = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUser },
    }).select("-clerkId");

    return res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsersForSidebar :", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getConversationsForSidebar = async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const conversations = await Message.aggregate([
      // 1. Keep only the messages the user has either sent or received
      {
        $match: {
          $or: [{ senderId: loggedInUser }, { receiverId: loggedInUser }],
        },
      },
      // 2. Sort by createdAt desc so that the first message per group is the latest
      { $sort: { createdAt: -1 } },
      // 3. Group by the conversation partner
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", loggedInUser] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      // 4. Look up partner's user profile
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      // 5. Look up unread count from this partner to the logged-in user
      {
        $lookup: {
          from: "messages",
          let: { partnerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$senderId", "$$partnerId"] },
                    { $eq: ["$receiverId", loggedInUser] },
                    { $eq: ["$isRead", false] }
                  ]
                }
              }
            },
            { $count: "count" }
          ],
          as: "unreadCountData"
        }
      },
      // 6. Project final structure
      {
        $project: {
          _id: "$user._id",
          fullName: "$user.fullName",
          email: "$user.email",
          profilePic: "$user.profilePic",
          lastMessageText: "$lastMessage.text",
          lastMessageImage: "$lastMessage.image",
          lastMessageVideo: "$lastMessage.video",
          lastMessageAt: "$lastMessage.createdAt",
          unreadCount: {
            $ifNull: [{ $arrayElemAt: ["$unreadCountData.count", 0] }, 0]
          }
        }
      },
      // 7. Sort conversations by lastMessageAt descending
      { $sort: { lastMessageAt: -1 } }
    ]);

    return res.status(200).json(conversations);
  } catch (error) {
    console.log("Error in message Controller/ getconversations", error.message);
    return res.status(500).json({ message: "internal server error" });
  }
};


export const getMessages = async(req, res)=>{
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // Mark all unread messages from this partner to me as read
    await Message.updateMany(
      { senderId: userToChatId, receiverId: myId, isRead: false },
      { $set: { isRead: true } }
    );

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const sendMessage = async(req, res)=> {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    let videoUrl;

    if (req.file) {
      if (!hasImageKitConfig()) {
        return res.status(500).json({ message: "Media upload is not configured" });
      }

      const url = await uploadChatMedia(req.file);
      if (req.file.mimetype.startsWith("video/")) videoUrl = url;
      else imageUrl = url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      video: videoUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Also emit to sender's room so other tabs/devices of the sender are updated in real-time
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId && senderSocketId !== receiverSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}