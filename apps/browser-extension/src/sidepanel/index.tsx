import React from 'react';
import ReactDOM from 'react-dom/client';
import SidePanelApp from './SidePanelApp.tsx';
import { AuthWrapper } from '../components/AuthWrapper';
import '../styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthWrapper>
            <SidePanelApp />
        </AuthWrapper>
    </React.StrictMode>
);
