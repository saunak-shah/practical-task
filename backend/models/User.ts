import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  emailID: string;
  phoneNumber: number;
  contryCode: string;
  password: string;
  createdAt: Date;
  updatedAt?: Date;
  active: boolean;
}

const UserSchema: Schema = new Schema(
  {
    fullName: { type: String, require: true },
    emailID: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    contryCode: { type: String, required: true, default: "+91" },
    password: { type: String, required: true },
    createdAt: {type: String, default: Date.now},
    updatedAt: {type: String, default: Date.now},
    active: {type: Boolean, default: true},
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", UserSchema);
