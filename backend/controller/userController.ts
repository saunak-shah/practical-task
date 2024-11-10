import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { ROLE_ACCESS } from "../global/constant";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Load environment configuration
dotenv.config();

export const signUp = async (req: Request, res: Response): Promise<void> => {
  const { fullName, emailID, phoneNumber, password, confirmPassword } =
    req.body;

  // check basic parameter validation
  if (!fullName || !emailID || !phoneNumber || !password || !confirmPassword) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  // email validation
  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!emailRegex.test(emailID)) {
    res.status(400).json({ message: "Invalid email." });
    return;
  }
  // Phone number validation
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phoneNumber)) {
    res.status(400).json({ message: "Invalid phone numer." });
    return;
  }

  // Password validation
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message: `Password should follow this crieteria. (Minimum 8 char, 
            with altest: 1 Upper case, 1 lower case, 1 special char, 1 Number).`,
    });
    return;
  }

  if (password !== confirmPassword) {
    res
      .status(400)
      .json({ message: "Password and confirm password are not same." });
    return;
  }

  try {
    // check email already exists
    const checkUserEmail = await User.findOne({ emailID });

    if (checkUserEmail) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      emailID,
      phoneNumber,
      password: hashedPassword,
    });

    await newUser.save();

    // generate token
    const token = jwt.sign(
      { userId: newUser._id },
      `${process.env.JWT_SECRET_KEY}`,
      {
        expiresIn: "7d",
      }
    );

    const responseObj = {
      fullName,
      emailID,
      phoneNumber,
      active: true
    };

    res.status(201).json({
      message: "User created successfully.",
      token,
      user: responseObj,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { emailID, password } = req.body;

  // Basic validation
  if (!emailID || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  try {
    // Find user by email
    const user = await User.findOne({ emailID });
    if (!user) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    // Compare the password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id },
      `${process.env.JWT_SECRET_KEY}`,
      { expiresIn: "7d" }
    );

    /* if(user.active){
      res.status(400).json({ message: "Admin users are not authorized to access this website." });
      return;
    } */

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        fullName: user.fullName,
        emailID: user.emailID,
        phoneNumber: user.phoneNumber,
        active: user.active
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1; // default to page 1
    const limit = parseInt(req.query.limit as string) || 10; // default to 10 items per page
    const skip = (page - 1) * limit;

    // Sorting parameters
    const sortField = (req.query.sortField as string) || "createdAt"; // default to createdAt field
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1; // sort order: -1 for descending, 1 for ascending

    const createdAtFrom = req.query.createdAtFrom
      ? new Date(req.query.createdAtFrom as string)
      : null;
    const createdAtTo = req.query.createdAtTo
      ? new Date(req.query.createdAtTo as string)
      : null;

    // filter object
    const filter: any = {};
    if (createdAtFrom || createdAtTo) {
      filter.createdAt = {};
      if (createdAtFrom) filter.createdAt.$gte = createdAtFrom;
      if (createdAtTo) filter.createdAt.$lte = createdAtTo;
    }
    const users = await User.find(filter)
      .sort({ [sortField]: sortOrder }) // dynamic sorting
      .skip(skip)
      .limit(limit);

    // Total count of active products for pagination metadata
    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update a product
export const updateUserStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, active } = req.body;

  try {
    const user: any = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Update user details
    user.active = active;
    user.updatedAt = new Date();

    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
