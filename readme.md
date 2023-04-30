# MERN Ecommerce App

- server.js

```js
import express from "express";
const app = express();
const PORT = process.env.PORT || 3000;
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";

// configure dotenv
dotenv.config();

//database config
connectDB();

//middlewares
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("<h1>Server is up and running</h1>");
});

app.listen(PORT, (req, res) => {
  console.log(
    `server is running on ${process.env.DEV_MODE} mode on port ${PORT}`
  );
});
```

- config/db.js

```js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`Connected to mongodb database ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error in mongodb ${error}`);
  }
};

export default connectDB;
```

- create 4 folders in the root folder 1. model, 2. routes, 3. controllers, 4. utils(helpers)

## create userschema

- userModel

```js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    adress: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
); // when a new user is created, the time of creation will be added

export default mongoose.model("users", userSchema);
```

## create route for the user

- routes/ authRoute.js

```js
import express from "express";
import { registerController } from "../controllers/authController.js";

//router object
const router = express.Router();

//routing

//REGISTER || METHOD POST
router.post("/register", registerController);

export default router;
```

## create controller

- controller / authController.js

```js
export const registerController = () => {};
```

- import authRoutes in server.js

```js
import express from "express";
const app = express();
const PORT = process.env.PORT || 3000;
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";

// configure dotenv
dotenv.config();

//database config
connectDB();

//middlewares
app.use(express.json());
app.use(morgan("dev"));

//routes
app.use("/api/v1/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("<h1>Server is up and running</h1>");
});

app.listen(PORT, (req, res) => {
  console.log(
    `server is running on ${process.env.DEV_MODE} mode on port ${PORT}`
  );
});
```

## work on register and password hashing

- [install bcrypt](https://www.npmjs.com/package/bcrypt)
- create new file called `authHelper.js` inside helpers folder
- create two functions inside `authHelper.js` file
- one for hashing the password and the second function is for comparing and bcrypt

- helpers/ authHepler.js

```js
import bcrypt from "bcrypt";
import { hashPassword } from "./authHelper";

export const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.log(error);
  }
};

export const comparePassword = (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};
```

## auth controller

- controllers/ auth.controller.js

```js
import { hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    //validation
    if (!name) {
      return res.send({ error: "Name is required" });
    }
    if (!email) {
      return res.send({ error: "Email is required" });
    }
    if (!password) {
      return res.send({ error: "Password is required" });
    }
    if (!phone) {
      return res.send({ error: "Phone number is required" });
    }
    if (!adress) {
      return res.send({ error: "Adress is required" });
    }

    //check user
    const existingUser = await userModel.findOne({ email });
    //existing user
    if (existingUser) {
      return res.status(200).send({
        success: true,
        message: "Already registered, please login",
      });
    }
    //register user
    const hashedPassword = await hashPassword(password);
    // save
    const user = new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
    }).save();
    res.status(201).send({
      success: true,
      message: "User Register Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Registration",
      error,
    });
  }
};
```

## login API

- Create login route, use jsonWebToken to secure our application
- [install jsonWebToken](https://www.npmjs.com/package/jsonwebtoken)
- import it in `authController.js`

```js
import jwt from "jsonwebtoken";
```

- create a secret key in `.env`

- controllers/authController.js

```js
//POST LOGIN
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validate
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "invalid email or password",
      });
    }
    // check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registered",
      });
    }
    //compare password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(404).send({
        success: false,
        message: "Invalid password",
      });
    }
    //token
    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Login",
      error,
    });
  }
};
```

- routes/auth.routes.js

```js
//LOGIN || POST
router.post("/login", loginController);
```
