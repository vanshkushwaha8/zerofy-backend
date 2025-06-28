import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


const allowedOrigins = ['https://zerofy-tawny.vercel.app/', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Not allowed - ${origin}`));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));


app.use(express.json());


const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});


const spreadsheetId = process.env.SPREADSHEET_ID;


app.post('/submit', async (req, res) => {
  const { name, email, resume } = req.body;
  console.log(' Received submission:', { name, email, resume });

  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[name, email, resume, new Date().toLocaleString()]],
      },
    });

    console.log(' Data saved to Google Sheet.');
    res.status(200).json({ message: 'Form submitted successfully!' });
  } catch (error) {
    console.error(' Error saving to Google Sheet:', error);
    res.status(500).json({ message: 'Failed to submit the form.' });
  }
});


app.listen(PORT, () => {
  console.log(` Server is running on port this  ${PORT}`);
});
