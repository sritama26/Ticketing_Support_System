import React from "react";
import Navigation from "../../Components/Navigation/Navigation";
import Footer from "../../Components/Footer/Footer";

function Error404({ setRoute }) {
  return (
    <div className="app-shell">
      <Navigation setRoute={setRoute} currentPage="error" />

      <main className="page-content">
        <section className="card-shell stack-md">
          <h2 className="section-title">404</h2>
          <p className="body-copy">The page you requested could not be found.</p>
          <div className="action-row">
            <button
              className="primary-button"
              onClick={function () {
                setRoute({ page: "home", mode: "dashboard", ticketId: null });
              }}
            >
              Return Home
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Error404;