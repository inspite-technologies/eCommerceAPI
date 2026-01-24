import User from "../modals/userSchema.js";
import generateToken from "../utils/generateToken.js";

const userSignup = async (req, res) => {
  const { phoneNumber } = req.body;
  try {
    const existUser = await User.findOne({ phoneNumber });
    if (existUser) {
      return res.status(400).json({
        msg: "User already exist",
      });
    }
    const userDetails = await User.create(req.body);
    res.status(201).json({
      msg: "User detailes added succesfully",

      data:userDetails,
    });
  } catch (err) {
    res.status(400).json({
      err,
    });
  }
};
const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const existUser = await User.findOne({ email });

    if (!existUser) {
      return res.status(400).json({
        msg: "User not found",
      });
    }

    const isMatch = await existUser.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({
        msg: "Incorrect password",
      });
    }

    return res.status(200).json({
      msg: "Login success",
      data: generateToken(existUser._id),
    });

  } catch (err) {
    console.error("Login Error:", err.message);
    return res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
};


const updateDetails = async (req, res) => {
  try {
    let id = req.params.id;
    const updateUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(201).json({
      msg: "User details updated succesfully",
      data: updateUser,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

const getUserDetails = async (req, res) => {
  let id = req.user._id
  try {
    const getUser = await User.findById(id);
    res.status(201).json({
      msg: "user details fetched successfully",
      data: getUser,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

const deleteUserDetails = async (req, res) => {
  let id = req.params.id;
  try {
    const deleteUser = await User.findByIdAndDelete(id);
    res.status(201).json({
      msg: "User deleted successfully",
      data: deleteUser,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};


export { userSignup, userLogin, updateDetails, getUserDetails,deleteUserDetails };
