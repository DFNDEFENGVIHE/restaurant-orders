import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import nodemailer from "nodemailer";

// Load environment variables
dotenv.config();

// App setup
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db("restaurant");
const ordersCollection = db.collection("orders");

// Endpoint to receive orders
app.post("/order", async (req, res) => {
  const order = req.body;
  await ordersCollection.insertOne(order);

  // Send email to owner
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.OWNER_EMAIL,
      pass: process.env.OWNER_EMAIL_PASSWORD
    }
  });

  await transporter.sendMail({
    from: process.env.OWNER_EMAIL,
    to: process.env.OWNER_EMAIL,
    subject: "New Order Received",
    text: JSON.stringify(order, null, 2)
  });

  res.send({ success: true });
});

// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
