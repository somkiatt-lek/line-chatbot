const {google} = require('googleapis');
const stream = require('stream');

function getAuth() {
  const scopes = ['https://www.googleapis.com/auth/drive.file'];
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    return new google.auth.GoogleAuth({
      credentials,
      scopes,
    });
  }
  if (process.env.GOOGLE_SERVICE_ACCOUNT_FILE) {
    return new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_FILE,
      scopes,
    });
  }
  throw new Error('Google service account credentials not provided. Set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_FILE');
}

function bufferToStream(buffer) {
  return stream.Readable.from(buffer);
}

async function uploadBuffer(buffer, filename, mimeType) {
  const auth = getAuth();
  const drive = google.drive({version: 'v3', auth});

  const parents = process.env.DRIVE_FOLDER_ID ? [process.env.DRIVE_FOLDER_ID] : undefined;

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents,
      mimeType,
    },
    media: {
      mimeType,
      body: bufferToStream(buffer),
    },
    fields: 'id, webViewLink, mimeType',
  });
  return res.data;
}

module.exports = { uploadBuffer };
