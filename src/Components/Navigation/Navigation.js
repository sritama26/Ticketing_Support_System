import React from "react";
import "./Navigation.css";
import meedlyLogo from "../../Asset/Logo/meedly-logo.png";

function Navigation({ setRoute, route }) {
  function getClassName(mode) {
    return (!route?.mode && mode === "dashboard") || route?.mode === mode
      ? "navigation-link navigation-link-active"
      : "navigation-link";
  }

  return (
    <header className="navigation-wrapper">
      <div
        className="navigation-brand"
        onClick={function () {
          setRoute({
            page: "home",
            mode: "dashboard",
            ticketId: null,
            statusFilter: null,
            statusTitle: null
          });
        }}
      >
        <img src={meedlyLogo} alt="Meeedly Logo" className="navigation-logo" />
        <span className="navigation-brand-text">Meeedly Support System</span>
      </div>

      <nav className="navigation-links">
        <button
          className={getClassName("dashboard")}
          onClick={function () {
            setRoute({
              page: "home",
              mode: "dashboard",
              ticketId: null,
              statusFilter: null,
              statusTitle: null
            });
          }}
        >
          Dashboard
        </button>

        <button
          className={getClassName("create")}
          onClick={function () {
            setRoute({
              page: "home",
              mode: "create",
              ticketId: null,
              statusFilter: null,
              statusTitle: null
            });
          }}
        >
          Create Ticket
        </button>
      </nav>
    </header>
  );
}

export default Navigation;