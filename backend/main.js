require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { DocumentProcessorServiceClient } =
  require("@google-cloud/documentai").v1;

const app = express();
const port = 3001;
const client = new DocumentProcessorServiceClient();

const projectId = process.env.PROJECT_ID;
const location = process.env.LOCATION;
const processorId = process.env.PROCESSOR_ID;

const filePath = "coalSample.png";
const fs = require("fs").promises;

app.use(cors());
app.use(express.json({ limit: "100mb" }));

app.post("/process-document", async (req, res) => {
  //const { imageData } = req.body;
  const imageData = await fs.readFile(filePath);

  const encodedImage = Buffer.from(imageData).toString("base64");

  console.log("starting the process");
  console.log("imagedata", imageData);

  try {
    console.log("Starting the process");
    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    //const encodedImage = Buffer.from(imageData).toString("base64");

    const request = {
      name,
      rawDocument: {
        content: encodedImage,
        mimeType: "image/png",
      },
    };
    console.log("request", request);

    const [result] = await client.processDocument(request);
    const { document } = result;

    const getText = (textAnchor) => {
      if (!textAnchor.textSegments || textAnchor.textSegments.length === 0) {
        return "";
      }

      const startIndex = textAnchor.textSegments[0].startIndex || 0;
      const endIndex = textAnchor.textSegments[0].endIndex;

      return document.text.substring(startIndex, endIndex);
    };

    if (document.pages && document.pages.length > 0) {
      const [page1] = document.pages;
      if (page1.paragraphs && page1.paragraphs.length > 0) {
        const paragraphs = page1.paragraphs.map((paragraph) =>
          getText(paragraph.layout.textAnchor)
        );
        return res.status(200).send({ paragraphs });
      } else {
        return res.status(200).send({ paragraphs: [] });
      }
    } else {
      return res.status(200).send({ paragraphs: [] });
    }
  } catch (error) {
    console.error("Error processing document:", error);
    res.status(500).send("Error processing document");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
