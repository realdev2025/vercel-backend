const { google } = require("googleapis");
const fs = require("fs");
const admin = require("firebase-admin");
require("dotenv").config();

admin.initializeApp({
  credential: admin.credential.cert(process.env.FIREBASE_CREDENTIAL_PATH),
});

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_API_KEY_PATH,
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth });

module.exports = async (req, res) => {
  if (req.method === "POST") {
    try {
      const file = req.body;
      const mimeType = file.mimetype;

      const fileMetadata = {
        name: file.name,
      };

      const media = {
        mimeType,
        body: fs.createReadStream(file.path),
      };

      const response = await drive.files.create({
        resource: fileMetadata,
        media,
        fields: "id",
      });

      res.status(200).json({ success: true, fileId: response.data.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
};
