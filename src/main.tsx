import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Provide Buffer global for browser when used by dependencies expecting Node's Buffer
import { Buffer } from 'buffer'

declare global {
	interface Window {
		Buffer: typeof Buffer;
	}
}

if (typeof window !== 'undefined') {
	window.Buffer = window.Buffer || Buffer
}

createRoot(document.getElementById("root")!).render(<App />);
