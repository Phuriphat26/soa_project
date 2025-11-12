import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // (1) Import
import App from './App.jsx';
import './index.css'; // (ไฟล์เปล่าที่เราล้าง)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* (2) หุ้ม App ของเรา */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);