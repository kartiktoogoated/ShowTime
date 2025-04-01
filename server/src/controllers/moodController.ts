import { Request, Response } from "express";
import Sentiment from "sentiment";
import { PrismaClient } from "@prisma/client";
import "../../types/express"; // Ensures TS loads your custom type augmentations

const prisma = new PrismaClient();
const sentimentAnalyser = new Sentiment();

export const analyzeMood = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { message } = req.body;

  // Check using our renamed property to avoid collisions.
  if (!req.prismaUser) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }

  // Now TS knows that prismaUser is a PrismaUser with an 'id'
  const userId = req.prismaUser.id;

  const { score } = sentimentAnalyser.analyze(message);
  const mood = detectedMood(message, score);

  const saved = await prisma.userMood.create({
    data: {
      userId,
      message,
      mood,
      sentiment: score,
    },
  });

  const suggestions = await getRecommendationsByMood(mood);

  res.json({ mood, sentiment: score, suggestions });
};

// Basic keyword + sentiment-based mood detection
function detectedMood(message: string, score: number): string {
  const msg = message.toLowerCase();

  if (msg.includes("tired") || msg.includes("long day")) return "Relaxing";
  if (msg.includes("happy") || score > 2) return "Comedy";
  if (msg.includes("romantic") || msg.includes("love")) return "Romance";
  if (score < -3 || msg.includes("bad")) return "Feel-Good";
  if (msg.includes("productive") || msg.includes("motivated"))
    return "Motivational";

  return score >= 0 ? "Feel-Good" : "Chill";
}

async function getRecommendationsByMood(mood: string) {
  return await prisma.movie.findMany({
    where: {
      genre: {
        contains: mood,
        mode: "insensitive",
      },
    },
    take: 5,
  });
}
