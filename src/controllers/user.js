import { Post, User } from "../db";
import logger from "../logger";

export const getUser = async (req, res) => {
  try {
    // const {
    //   user: { id },
    // } = req;
    const { id } = req.params;
    console.log(id);
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    return res
      .status(200)
      .json({ message: "verified", success: true, data: user });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: error.message, success: false });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const posts = await Post.find({ user: id });

    return res
      .status(200)
      .json({ message: "fetched user posts", success: true, data: posts });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: error.message, success: false });
  }
};

export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
  const {
    user: { id },
  } = req;

  if (userId === id) {
    return res.status(400).json({ message: "something went wrong" });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  const currentUser = await User.findById(id);
  const index = user.followers.findIndex((item) => item == id);
  if (index == -1) {
    user.followers.push(id);
    currentUser.following.push(user._id.toString());
  } else {
    user.followers.splice(index, 1);
    currentUser.following.filter((item) => item != user._id.toString());
  }


  await user.save();
  await currentUser.save();
  return res.status(200).json({ message: "followed", success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message, success: false });
  }

};
