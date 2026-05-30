const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_DRIVE_CLIENT_ID,
  process.env.GOOGLE_DRIVE_CLIENT_SECRET,
  process.env.GOOGLE_DRIVE_REDIRECT_URI
);

const drive = google.drive({ version: 'v3', auth: oauth2Client });

const listFiles = async () => {
  try {
    const response = await drive.files.list({
      pageSize: 10,
      fields: 'nextPageToken, files(id, name)',
    });
    return response.data.files;
  } catch (error) {
    throw new Error('Google Drive API failed');
  }
};

module.exports = { listFiles };
