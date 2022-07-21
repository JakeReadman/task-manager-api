const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        age: {
            type: Number,
            validate: (value) => {
                if (value < 0) {
                    throw new Error("Age must be a positive number");
                }
            },
            default: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            validate: (value) => {
                if (!validator.isEmail(value)) {
                    throw new Error("email is invalid");
                }
            },
            trim: true,
            lowerCase: true,
        },
        password: {
            type: String,
            required: true,
            minLength: 7,
            trim: true,
            validate: (value) => {
                if (value.toLowerCase().includes("password")) {
                    throw new Error("Must not contain 'password'");
                }
            },
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
        avatar: {
            type: Buffer,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "userId",
});

//Remove private info from return user object
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
};

//Generate auth token
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, "thisismynodeapp");
    user.tokens = [...user.tokens, { token }];
    await user.save();
    return token;
};

//Find user by email and password
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("Unable to login");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Unable to login");
    }

    return user;
};

//Hash plain text password
userSchema.pre("save", async function (next) {
    const user = this;

    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

//Delete user tasks when user is removed
userSchema.pre("remove", async function (next) {
    const user = this;
    await Task.deleteMany({ userId: user._id });
    next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
