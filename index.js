import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Google Auth setup
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Spreadsheet ID from .env
const spreadsheetId = process.env.SPREADSHEET_ID;

app.post('/submit', async (req, res) => {
  const { name, email, resume } = req.body;

  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A1', // Sheet name
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[name, email, resume, new Date().toLocaleString()]],
      },
    });

    res.status(200).json({ message: 'Form submitted successfully!' });
  } catch (error) {
    console.error(' Error saving to Google Sheet:', error);
    res.status(500).json({ message: 'Failed to submit form.' });
  }
});

app.listen(PORT, () => {
  console.log(` Server is running on http://localhost:${PORT}`);
});
