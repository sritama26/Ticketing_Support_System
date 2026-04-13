import React, { useState } from "react";
import Home from "../View/Home/Home";
import About from "../View/About/About";
import Settings from "../View/Settings/settings";
import Error404 from "../View/Error/Error404";


function MainRoute() {
  const [route, setRoute] = useState({
    page: "home",
    mode: "dashboard",
    ticketId: null
  });

  if (route.page === "home") {
    return <Home route={route} setRoute={setRoute} />;
  }

  if (route.page === "about") {
    return <About setRoute={setRoute} />;
  }

  if (route.page === "settings") {
    return <Settings setRoute={setRoute} />;
  }

  return <Error404 setRoute={setRoute} />;
}

export default MainRoute;