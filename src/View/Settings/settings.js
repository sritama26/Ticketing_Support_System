import React from "react";
import Navigation from "../../Components/Navigation/Navigation";
import Footer from "../../Components/Footer/Footer";

function Settings({ setRoute }) {
  return (
    <div className="app-shell">
      <Navigation setRoute={setRoute} currentPage="settings" />

      <main className="page-content">
        <section className="card-shell stack-md">
          <h2 className="section-title">Settings</h2>
          <p className="body-copy">
            This page is included to match the required structure. You can later expand it with queue defaults,
            display preferences, or user-specific workflow settings.
          </p>
          <div className="action-row">
            <button
              className="primary-button"
              onClick={function () {
                setRoute({ page: "home", mode: "dashboard", ticketId: null });
              }}
            >
              Back to Home
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Settings;