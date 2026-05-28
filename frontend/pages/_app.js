import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      <div className="app-bg" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="gradient-overlay" />
      </div>
      <Component {...pageProps} />
    </>
  );
}
