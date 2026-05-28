const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const Bookmark = require('./models/Bookmark');

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bookmarks';

mongoose.set('strictQuery', false);
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  });

app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

const isValidUrl = (urlString) => {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

app.get('/api/bookmarks', async (req, res) => {
  const bookmarks = await Bookmark.find().sort({ createdAt: -1 });
  res.json(bookmarks);
});

app.post('/api/bookmarks', async (req, res) => {
  const { title, url, tags = [], isFavorite = false } = req.body;

  if (!title || !url) {
    return res.status(400).json({ error: 'Title and URL are required.' });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'URL must be a valid http or https address.' });
  }

  try {
    const existing = await Bookmark.findOne({ url });
    if (existing) {
      return res.status(409).json({ error: 'A bookmark with this URL already exists.' });
    }

    const bookmark = await Bookmark.create({
      title,
      url,
      tags: Array.isArray(tags) ? tags : [],
      isFavorite,
    });

    res.status(201).json(bookmark);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create bookmark.' });
  }
});

app.patch('/api/bookmarks/:id/favorite', async (req, res) => {
  const { id } = req.params;
  const { isFavorite } = req.body;

  try {
    const bookmark = await Bookmark.findByIdAndUpdate(
      id,
      { isFavorite: Boolean(isFavorite) },
      { new: true }
    );

    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found.' });
    }

    res.json(bookmark);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update favorite status.' });
  }
});

app.delete('/api/bookmarks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const bookmark = await Bookmark.findByIdAndDelete(id);
    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found.' });
    }

    res.json({ message: 'Bookmark deleted.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete bookmark.' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

app.listen(port, () => {
  console.log(`Bookmark API listening at http://localhost:${port}`);
});
