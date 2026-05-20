import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, trim: true },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, minlength: 8, select: false },
    },
    { timestamps: true },
);

userSchema.pre("save", async function () {
    try {
        if (!this.isModified("password")) return;
        this.password = await bcrypt.hash(this.password, 8);
    } catch (err) {
        throw new Error("Hashing password failed: " + err.message);
    }
});
export const User = mongoose.model("User", userSchema);
