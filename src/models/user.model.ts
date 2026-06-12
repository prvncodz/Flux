import mongoose, { Schema, Document, Types, Model, HydratedDocument } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export interface IAvatar {
    url: string;
    public_id: string;
}

export interface IUser extends Document {
    userName: string;
    email: string;
    fullName: string;
    avatar: IAvatar;
    coverImage?: Partial<IAvatar>;
    password: string;
    watchHistory?: Types.ObjectId[];
    refreshTokens?: string;
}

interface UserMethods {
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessTokens(): Promise<string>;
    generateRefreshTokens(): Promise<string>;
}

type UserDocument = HydratedDocument<IUser, UserMethods>;

const userSchema = new Schema<IUser, Model<IUser, {}, UserMethods>>(
    {
        userName: {
            type: String,
            unique: [true, "username is already taken"],
            required: [true, "username is required"],
            lowercase: true,
            trim: true,
        },
        email: {
            type: String,
            required: [true, "email is required"],
            unique: [true, "email is already taken"],
            trim: true,
        },
        fullName: {
            type: String,
            required: [true, "full name is required"],
            trim: true,
        },
        avatar: {
            url: {
                type: String,
                required: true,
            },
            public_id: {
                type: String,
                required: true,
            },
        },
        coverImage: {
            url: String,
            public_id: String,
        },
        password: {
            type: String,
            required: [true, "password is required"],
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
        refreshTokens: {
            type: String,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

userSchema.methods.isPasswordCorrect = async function (this:UserDocument,password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessTokens = async function (this: UserDocument): Promise<string> {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET!,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY as any,
        }
    );
};

userSchema.methods.generateRefreshTokens = async function (this: UserDocument): Promise<string> {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName,
        },
        String(process.env.REFRESH_TOKEN_SECRET)!,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY as any,
        }
    );
};

export const User = mongoose.model<IUser, Model<IUser, {}, UserMethods>>("User", userSchema);
