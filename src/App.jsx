import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StoryLayout from "./components/StoryLayout.jsx";

import "/styles/modern-normalize.css";
import "/styles/global.css";
import "/styles/utility.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StoryLayout />} />
      </Routes>
    </Router>
  );
}
