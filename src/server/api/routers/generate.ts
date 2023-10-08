import { TRPCError } from "@trpc/server";
import { z } from "zod";
import OpenAI from "openai";
import AWS from "aws-sdk";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

import { env } from "~/env.mjs";
import { b64Image } from "~/data/b64Image";

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: env.ACCESS_KEY_ID,
    secretAccessKey: env.SECRET_ACCESS_KEY,
  },
});

async function generateIcon(prompt: string): Promise<string | undefined> {
  if (env.MOCK_DALLE === "true") {
    return b64Image;
  } else {
    const response = await openai.images.generate({
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });
    return response.data[0]?.b64_json;
  }
}

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const generateRouter = createTRPCRouter({
  generateIcon: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
        color: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: verify the user has enough credit
      const { count } = await ctx.prisma.user.updateMany({
        where: {
          id: ctx.session.user.id,
          credits: {
            gte: 1,
          },
        },
        data: {
          credits: {
            decrement: 1,
          },
        },
      });

      if (count <= 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You do not have enough credits",
        });
      }

      const finalPrompt = `a modern icon in ${input.color} of a ${input.prompt}`;

      // make a fetch request to DALL-E
      const base64EncodedImage = await generateIcon(finalPrompt);

      // create Icon record in db
      const icon = await ctx.prisma.icon.create({
        data: {
          prompt: input.prompt,
          // color: input.color,
          userId: ctx.session.user.id,
        },
      });

      // TODO: save the images to s3 bucket
      await s3
        .putObject({
          Bucket: env.BUCKET_NAME,
          Body: Buffer.from(base64EncodedImage!, "base64"),
          Key: icon.id,
          ContentEncoding: "base64",
          ContentType: "image/gif",
        })
        .promise();

      return {
        imageUrl: `https://${env.BUCKET_NAME}.s3.amazonaws.com/${icon.id}`,
      };
    }),
});
