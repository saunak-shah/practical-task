"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var UserSchema = new mongoose_1.Schema({
    fullName: { type: String, require: true },
    emailID: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    contryCode: { type: String, required: true, "default": "+91" },
    password: { type: String, required: true },
    createdAt: { type: String, "default": Date.now },
    updatedAt: { type: String, "default": Date.now },
    active: { type: Boolean, "default": true }
}, {
    timestamps: true
});
exports.User = mongoose_1["default"].model("User", UserSchema);
