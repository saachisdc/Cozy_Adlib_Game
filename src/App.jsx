import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Game from "./components/Game.jsx";

import "/styles/modern-normalize.css";
import "/styles/global.css";
import "/styles/components/storylayout.css";
import "/styles/utility.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Game />} />
      </Routes>
    </Router>
  );
}
