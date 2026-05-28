import { useEffect, useMemo, useState } from 'react';

const apiBase = 'https://bookmark-manager-2.onrender.com';
const validateUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export default function Home() {
  const [bookmarks, setBookmarks] = useState([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedTag, setSelectedTag] = useState('all');
  const [mounted, setMounted] = useState(false);

  const fetchBookmarks = async () => {
    try {
      const response = await fetch(`${apiBase}/api/bookmarks`);
      const data = await response.json();
      setBookmarks(data);
    } catch (err) {
      setError('Unable to load bookmarks.');
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchBookmarks();
  }, []);

  const tags = useMemo(() => {
    const unique = new Set();
    bookmarks.forEach((bookmark) => bookmark.tags.forEach((tag) => unique.add(tag)));
    return Array.from(unique).sort();
  }, [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((bookmark) => {
      if (showFavoritesOnly && !bookmark.isFavorite) {
        return false;
      }
      if (selectedTag !== 'all' && !bookmark.tags.includes(selectedTag)) {
        return false;
      }
      return true;
    });
  }, [bookmarks, selectedTag, showFavoritesOnly]);

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setTagsText('');
    setError('');
  };

  const handleAddBookmark = async (event) => {
    event.preventDefault();
    setError('');

    if (!title.trim() || !url.trim()) {
      setError('Title and URL are required.');
      return;
    }

    if (!validateUrl(url.trim())) {
      setError('Please enter a valid http or https URL.');
      return;
    }

    const tags = tagsText
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/bookmarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title.trim(), url: url.trim(), tags }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to add bookmark.');
      } else {
        setBookmarks((current) => [data, ...current]);
        resetForm();
      }
    } catch (err) {
      setError('Unable to reach the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      const response = await fetch(`${apiBase}/api/bookmarks/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Unable to delete bookmark.');
        return;
      }

      setBookmarks((current) => current.filter((bookmark) => bookmark._id !== id));
    } catch {
      setError('Unable to delete bookmark.');
    }
  };

  const toggleFavorite = async (id, isFavorite) => {
    try {
      const response = await fetch(`${apiBase}/api/bookmarks/${id}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !isFavorite }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Unable to update favorite status.');
        return;
      }

      setBookmarks((current) =>
        current.map((bookmark) => (bookmark._id === id ? data : bookmark))
      );
    } catch {
      setError('Unable to update favorite status.');
    }
  };

  return (
    <div className={`page-shell ${mounted ? 'visible' : ''}`}>
      <header className="hero">
        <div>
          <p className="eyebrow">Mini Bookmark Manager</p>
          <h1>Save, filter, and favorite bookmarks.</h1>
          <p className="subtitle">
            Add a new bookmark, mark favorites, and filter results locally without extra API requests.
          </p>
        </div>
      </header>

      <main>
        <section className="panel form-panel add-panel">
          <div className="panel-topbar">
            <span className="panel-pill"></span>
            <h2>Add Bookmark</h2>
          </div>
          <form onSubmit={handleAddBookmark} className="bookmark-form">
            <label>
              Title
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Bookmark title" />
            </label>
            <label>
              URL
              <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com" />
            </label>
            <label>
              Tags (comma separated)
              <input
                value={tagsText}
                onChange={(event) => setTagsText(event.target.value)}
                placeholder="news, tools, work"
              />
            </label>
            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Add Bookmark'}
              </button>
              <button type="button" className="secondary" onClick={resetForm}>
                Reset
              </button>
            </div>
            {error ? <p className="error-message">{error}</p> : null}
          </form>
          <div className="floating-card" aria-hidden="true">
            <span>+</span>
            <div>
              <strong>Add card</strong>
              <p>Drop in your next favorite bookmark.</p>
            </div>
          </div>
        </section>

        <section className="panel filters-panel filter-panel">
          <div className="panel-topbar">
            <span className="panel-pill pill-accent"></span>
            <h2>Filters</h2>
            <button type="button" className="favorite-toggle" onClick={() => setShowFavoritesOnly((value) => !value)}>
              {showFavoritesOnly ? 'Showing Favorites' : 'Show Favorites Only'}
            </button>
          </div>

          <div className="filter-row">
            <label>
              Tag
              <select value={selectedTag} onChange={(event) => setSelectedTag(event.target.value)}>
                <option value="all">All tags</option>
                {tags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="secondary" onClick={() => setSelectedTag('all')}>
              Clear Tag Filter
            </button>
          </div>
        </section>

        <section className="panel grid-panel view-panel">
          <div className="panel-topbar">
            <span className="panel-pill pill-muted"></span>
            <h2>Bookmarks</h2>
            <span className="count-badge">
              <span>{filteredBookmarks.length}</span> items
            </span>
          </div>

          {filteredBookmarks.length === 0 ? (
            <div className="empty-state">
              <p>No bookmarks match the current filters.</p>
            </div>
          ) : (
            <div className="bookmark-grid">
              {filteredBookmarks.map((bookmark, index) => (
                <article
                  key={bookmark._id}
                  className="bookmark-card"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="card-top">
                    <a href={bookmark.url} target="_blank" rel="noreferrer" className="bookmark-title">
                      {bookmark.title}
                    </a>
                    <button
                      type="button"
                      className={bookmark.isFavorite ? 'favorite active' : 'favorite'}
                      onClick={() => toggleFavorite(bookmark._id, bookmark.isFavorite)}
                    >
                      {bookmark.isFavorite ? '★' : '☆'}
                    </button>
                  </div>
                  <p className="bookmark-url">{bookmark.url}</p>
                  <div className="tags-row">
                    {bookmark.tags.length > 0 ? (
                      bookmark.tags.map((tag) => (
                        <span key={`${bookmark._id}-${tag}`} className="tag">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="tag muted">No tags</span>
                    )}
                  </div>
                  <div className="card-actions">
                    <button className="danger" type="button" onClick={() => handleRemove(bookmark._id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
