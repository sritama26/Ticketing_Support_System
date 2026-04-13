import React from "react";
import Navigation from "../../Components/Navigation/Navigation";
import Footer from "../../Components/Footer/Footer";

function About({ setRoute }) {
  return (
    <div className="app-shell">
      <Navigation setRoute={setRoute} currentPage="about" />

      <main className="page-content">
        <section className="card-shell stack-md">
          <h2 className="section-title">About This Project</h2>
          <p className="body-copy">
            This application is a scalable support ticket system built for a SaaS environment.
            It includes ticket creation, dashboard triage, conversation history, support replies,
            ticket assignment, filtering, and status tracking.
          </p>
          <p className="body-copy">
            The implementation is structured to show system thinking, maintainability, and
            practical support-team workflows.
          </p>
          <div className="action-row">
            <button
              className="primary-button"
              onClick={function () {
                setRoute({ page: "home", mode: "dashboard", ticketId: null });
              }}
            >
              Go to Dashboard
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default About;