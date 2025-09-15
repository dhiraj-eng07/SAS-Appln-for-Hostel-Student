import '../public/styles.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { initDb } from '../lib/db';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [initializing, setInitializing] = useState(true);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    // Initialize database on app load
    const initializeApp = async () => {
      try {
        console.log('Initializing application...');
        await initDb();
        console.log('Database initialized successfully');
        setInitializing(false);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setInitError(error.message);
        setInitializing(false);
      }
    };

    initializeApp();
  }, []);

  // Show loading state while initializing
  if (initializing) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2>Initializing Application...</h2>
        <p>Setting up database and preparing your environment</p>
        <div style={{ marginTop: '20px', width: '200px', height: '4px', backgroundColor: '#f0f0f0', borderRadius: '2px' }}>
          <div style={{ width: '100%', height: '100%', backgroundColor: '#3498db', borderRadius: '2px', animation: 'loading 1.5s infinite' }}></div>
        </div>
        <style jsx>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  // Show error state if initialization failed
  if (initError) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#e74c3c' }}>Initialization Error</h2>
        <p>Failed to initialize the application: {initError}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#7f8c8d' }}>
          Check your database connection and environment variables
        </p>
      </div>
    );
  }

  return <Component {...pageProps} />;
}

export default MyApp;