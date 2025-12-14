import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
/* import Main from "./Main/Main";
import Fall29aoi from "./AoI/Fall2029/Fall2029aoi"; */
import "/styles/modern-normalize.css";
import "/styles/global.css";
import "/styles/utility.css";

export default function App() {
  return (
    <Router>
      <div className="container">
        <h1> Cozy Adlib Game </h1>
        <p>
          'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
          commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus
          et magnis dis parturient montes, nascetur ridiculus mus. Donec quam
          felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla
          consequat massa quis enim. Donec pede justo, fringilla vel, aliquet
          nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a,
          venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium.
          Integer tincidunt. Cras dapibus. Vivamus elementum '
        </p>
        <button class="btn"> Hello </button>
        {/*       < <Menu />
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/fall29aoi" element={<Fall29aoi />} />
        </Routes>
        > */}
      </div>
    </Router>
  );
}
