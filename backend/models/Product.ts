import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  productName: string;
  productDesc: string;
  imageURL: string;
  createdBy: string;
  createdAt?: Date;
  isDelete: boolean;
  deletedAt?: Date;
}

const productSchema: Schema = new Schema(
    {
      productName: { type: String, required: true },
      productDesc: { type: String, required: true },
      imageURL: { type: String, required: false },
      createdBy: { type: String, required: false },
      isDelete: {type: Boolean, default: false},
      createdAt: { type: Date, default: Date.now },
      deletedAt: { type: Date, default: null }
    },
    {
      timestamps: true
    }
  );

  export const Product = mongoose.model<IProduct>("Product", productSchema)