require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { DocumentProcessorServiceClient } =
  require("@google-cloud/documentai").v1;

const app = express();
const port = 3001;

const projectId = process.env.PROJECT_ID;
const location = process.env.LOCATION;
const processorId = process.env.PROCESSOR_ID;

app.use(cors());
app.use(express.json({ limit: "100mb" }));

const fs = require("fs");
const path = require("path");

const base64Credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;

if (base64Credentials) {
  const credentialsPath = path.join(__dirname, "gcloud-credentials.json");
  fs.writeFileSync(credentialsPath, Buffer.from(base64Credentials, "base64"));
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
}

const client = new DocumentProcessorServiceClient();
app.get("/", (req, res) => {
  res.send("OK");
});

app.post("/process-document", async (req, res) => {
  const { imageData } = req.body;

  try {
    console.log("Starting the process");
    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    const request = {
      name,
      rawDocument: {
        content: imageData,
        mimeType: "image/png",
      },
    };
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

app.listen(process.env.PORT || port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
