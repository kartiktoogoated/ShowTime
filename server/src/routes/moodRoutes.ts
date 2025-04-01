import express from "express";
import { analyzeMood } from "../controllers/moodController";
import { authenticate } from "../middlewares/authMiddleware";

const moodRouter = express.Router();

moodRouter.post("/analyze", authenticate, analyzeMood);

export default moodRouter;
