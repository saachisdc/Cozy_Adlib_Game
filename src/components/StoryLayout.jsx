import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Game from "./Game.jsx";

import "/styles/modern-normalize.css";
import "/styles/global.css";
import "/styles/components/sectionfooter.css";
import "/styles/components/storylayout.css";
import "/styles/utility.css";

export default function StoryLayout() {
  return (
    <div className="container">
      <h1 className="title"> Cozy Madlib Game </h1>
      <div className="section game">
        <Game />
      </div>
    </div>
  );
}
