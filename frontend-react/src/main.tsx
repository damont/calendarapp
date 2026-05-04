import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

const rootNode = (
  <StrictMode>
    <App />
  </StrictMode>
);

createRoot(document.getElementById('root')!).render(
  googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>{rootNode}</GoogleOAuthProvider>
  ) : (
    rootNode
  ),
)
