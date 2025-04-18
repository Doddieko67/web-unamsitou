import { createPartFromUri, GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import { listFiles, delete_directory, create_directory } from "./listFiles.js";
import { config } from "dotenv";
import multer from "multer";

config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function uploadLocalPdf(filePath) {
  const file = await ai.files.upload({
    file: filePath,
    config: {
      displayName: filePath.split("---").pop(),
    },
  });

  // Wait for the file to be processed.
  let getFile = await ai.files.get({ name: file.name });
  while (getFile.state === "PROCESSING") {
    getFile = await ai.files.get({ name: file.name });
    console.log(`current file status: ${getFile.state}`);
    console.log("File is still processing, retrying in 5 seconds");

    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });
  }
  if (file.state === "FAILED") {
    throw new Error("File processing failed.");
  }

  return file;
}

export async function content_documents(prompt, targetDirectory) {
  // Add the file to the contents.
  const content = [prompt];
  const filenames = await listFiles(targetDirectory);
  console.log(filenames);
  for (const filename of filenames) {
    const file = await uploadLocalPdf(filename);
    if (file.uri && file.mimeType) {
      const fileContent = createPartFromUri(file.uri, file.mimeType);
      content.push(fileContent);
    }
  }
  console.log(content);

  return content;
}

export const get_ready = async (req, res, next) => {
  try {
    req.targetDirectory = req.user.id + "---" + Date.now();
    const targetDirectory = req.targetDirectory;
    console.log(targetDirectory);
    await create_directory(targetDirectory);
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, targetDirectory);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "---" + file.originalname);
      },
    });
    const upload = multer({ storage: storage, dest: targetDirectory });
    const uploadMiddleware = upload.array("fuentes", 12); // Store the middleware

    uploadMiddleware(req, res, (err) => {
      //Call the multer middleware directly inside the code.
      if (err) {
        console.error("Error during file upload with Multer:", err);
        return next(err); // Pass Multer error to the error handler
      }
      next(); // If no error pass to next middleware
    });
  } catch (error) {
    console.error("Error initializing multer:", error);
    next(error);
  }
};

export async function delete_documents(targetDirectory) {
  await delete_directory(targetDirectory);
}

export async function create_documents(targetDirectory) {
  await create_directory(targetDirectory);
}
