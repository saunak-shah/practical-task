import { Request, Response } from "express";
import { Product } from "../models/Product";
import dotenv from "dotenv";
import { IncomingForm } from "formidable";
import { uploadFileToFirebase } from "../controller/FileUploadController";
import moment from 'moment';
import { User } from "../models/User";


// Load environment configuration
dotenv.config();

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const form = new IncomingForm();

  try {
    const { fields, files }: { fields: any; files: any } = await new Promise(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      }
    );

    const productName = fields.productName[0];
    const productDesc = fields.productDesc[0];
    if (!productName || !productDesc) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const file = files.image?.[0];
    if (!file) {
      res.status(400).json({ message: "File is required" });
      return;
    }
    // File upload to Firebase Storage
    const imageUrl = await uploadFileToFirebase(file);

    // get user detail
    const userId = req.user?.userId;

    const user: any = await User.findById(userId);

    console.log("imageUrl ============", imageUrl);
    const newProduct = new Product({
      productName,
      productDesc,
      imageURL: imageUrl,
      createdBy: user.fullName
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product created successfully.",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error in createProduct:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// Update a product
export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const form = new IncomingForm();

  const { fields, files }: { fields: any; files: any } = await new Promise(
    (resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    }
  );

  const productName = fields.productName[0];
  const productDesc = fields.productDesc[0];
  if (!productName || !productDesc) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  const file = files.image?.[0];

  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    let imageUrl = product.imageURL;
    if (file) {
      imageUrl = await uploadFileToFirebase(file);
    }
    // File upload to Firebase Storage

    // Update product details
    product.productName = productName || product.productName;
    product.productDesc = productDesc || product.productDesc;
    product.imageURL = imageUrl || product.imageURL;

    await product.save();
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // product soft delete
    product.isDelete = true;
    product.deletedAt = new Date();
    await product.save();
    res.status(200).json({ message: "Product soft deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAllProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1; // default to page 1
    const limit = parseInt(req.query.limit as string) || 10; // default to 10 items per page
    const skip = (req.query.offset) ? parseInt(req.query.offset as string) : (page - 1) * limit;

    // Sorting parameters
    const sortField = (req.query.sortBy as string) || "createdAt"; // default to createdAt field
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1; // sort order: -1 for descending, 1 for ascending

    const createdAtFrom = req.query.createdAtFrom
      ? moment(req.query.createdAtFrom as string).startOf("day").format()
      : null;

      const createdAtTo = req.query.createdAtTo
      ? moment(req.query.createdAtTo as string).endOf("day").format()
      : null;


    // Build filter object
    const filter: any = {};
    // Filter parameters
    let productName = null;
    if (req.query.productId && req.query.productId !== 'None') {
      const productId = req.query.productId as string;
      const product = await Product.findById(productId);
      productName = product?.productName;
    }
    if (productName) {
      filter.productName = { $regex: new RegExp(productName, "i") }; // case-insensitive match
    }
    if (createdAtFrom || createdAtTo) {
      filter.createdAt = {};
      if (createdAtFrom) filter.createdAt.$gte = createdAtFrom;
      if (createdAtTo) filter.createdAt.$lte = createdAtTo;
    }

    let fieldsToReturn = ""; // Specify the fields you need

    if (req.query.filter_by) {
      fieldsToReturn = "productName createdAt";
    }

    const products = await Product.find(filter)
      .sort({ [sortField]: sortOrder }) // dynamic sorting
      .skip(skip)
      .limit(limit)
      .select(fieldsToReturn); // This will return only the specified fields

    // Total count of active products for pagination metadata
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      products,
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
