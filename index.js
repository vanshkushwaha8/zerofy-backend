import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'https://zerofy.netlify.app',
  'https://zerofy-tawny.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

// ✅ CORS Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ Blocked CORS for origin:', origin);
      callback(new Error(`CORS not allowed for ${origin}`));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: false  // Set to `true` only if you're using cookies
}));

// ✅ Express body parser
app.use(express.json());

// ✅ Google Sheets Auth setup
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const spreadsheetId = process.env.SPREADSHEET_ID;

// ✅ POST /submit Route
app.post('/submit', async (req, res) => {
  const { name, email, resume } = req.body;
  console.log('📩 Received submission:', { name, email, resume });

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

    res.status(200).json({ message: 'Form submitted successfully!' });
  } catch (error) {
    console.error('❌ Error saving to Google Sheet:', error);
    res.status(500).json({ message: 'Failed to submit the form.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
