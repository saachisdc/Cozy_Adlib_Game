import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Game from "./Game.jsx";

import "/styles/modern-normalize.css";
import "/styles/global.css";
import "/styles/components/sectionfooter.css";
import "/styles/utility.css";

export default function StoryLayout() {
  return (
    <div className="container">
      <h1 className="section title"> Cozy Adlib Game </h1>
      <div className="section game">
        <Game />
      </div>

      {/* section: footer */}

      <section className="footer container section">
        <hr className="footer__hr" />
        <p className="description">
          Copyright © 2025 Saachi Sadcha - All Rights Reserved.
        </p>
        <p className="footer__description">
          All images, 3D models, and content are original and created by Saachi
          Sadcha. Do not copy, download or sell.
        </p>
      </section>
    </div>
  );
}
