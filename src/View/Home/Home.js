import React, { useEffect, useMemo, useState } from "react";
import { LightButton, TextField, TextAreaField } from "noplin-uis";

import Navigation from "../../Components/Navigation/Navigation";
import Footer from "../../Components/Footer/Footer";
import { DateFormat, TimeAgo } from "../../Utilities/DateFormat";

import {
  CATEGORIES,
  DEFAULT_FILTERS,
  getCurrentTimestamp,
  getFilteredTickets,
  getSeedState,
  getSortOptions,
  getTicketMessages,
  getTicketStats,
  getUserById,
  INITIAL_FORM,
  loadTicketSystemState,
  formatLabel,
  generateMessageId,
  generateTicketId,
  PRIORITIES,
  saveTicketSystemState,
  TICKET_STATUSES,
  validateReplyForm,
  validateTicketInput
} from "../../Scripts/Home/CommonHomeUtils";

function Home({ route, setRoute }) {
  const [appState, setAppState] = useState(function () {
    return loadTicketSystemState() || getSeedState();
  });

  const [ticketForm, setTicketForm] = useState(INITIAL_FORM);
  const [ticketErrors, setTicketErrors] = useState({});
  const [attachedFiles, setAttachedFiles] = useState([]);

  const [replyForm, setReplyForm] = useState({
    senderId: "AGENT-1",
    visibility: "public",
    body: ""
  });
  const [replyError, setReplyError] = useState("");

  useEffect(function () {
    saveTicketSystemState(appState);
  }, [appState]);

  const agents = useMemo(function () {
    return appState.users.filter(function (user) {
      return user.role === "support_agent";
    });
  }, [appState.users]);

  useEffect(function () {
    if (!replyForm.senderId && agents.length > 0) {
      setReplyForm(function (previous) {
        return {
          ...previous,
          senderId: agents[0].id
        };
      });
    }
  }, [agents, replyForm.senderId]);

  const filteredTickets = useMemo(function () {
    return getFilteredTickets(appState.tickets, appState.filters || DEFAULT_FILTERS);
  }, [appState.tickets, appState.filters]);

  const stats = useMemo(function () {
    return getTicketStats(appState.tickets);
  }, [appState.tickets]);

  const selectedTicket = useMemo(function () {
    if (!route.ticketId) return null;

    return (
      appState.tickets.find(function (ticket) {
        return ticket.id === route.ticketId;
      }) || null
    );
  }, [appState.tickets, route.ticketId]);

  const selectedMessages = useMemo(function () {
    if (!selectedTicket) return [];
    return getTicketMessages(appState.messages, selectedTicket.id);
  }, [appState.messages, selectedTicket]);

  const statusPageTickets = useMemo(function () {
    if (!route.statusFilter) return [];

    if (route.statusFilter === "all_tickets") {
      return [...appState.tickets].sort(function (a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    if (route.statusFilter === "unassigned") {
      return appState.tickets.filter(function (ticket) {
        return !ticket.assignedTo;
      });
    }

    return appState.tickets.filter(function (ticket) {
      return ticket.status === route.statusFilter;
    });
  }, [appState.tickets, route.statusFilter]);

  function updateFilters(partialFilters) {
    setAppState(function (previous) {
      return {
        ...previous,
        filters: {
          ...(previous.filters || DEFAULT_FILTERS),
          ...partialFilters
        }
      };
    });
  }

  function resetFilters() {
    setAppState(function (previous) {
      return {
        ...previous,
        filters: { ...DEFAULT_FILTERS }
      };
    });
  }

  function openStatusPage(statusKey, title) {
    setRoute({
      page: "home",
      mode: "statusList",
      ticketId: null,
      statusFilter: statusKey,
      statusTitle: title,
      justSubmitted: false
    });
  }

  function getStatusPillClass(status) {
    if (status === "open") return "pill pill-open";
    if (status === "in_progress") return "pill pill-in-progress";
    if (status === "resolved") return "pill pill-resolved";
    return "pill";
  }

  function createTicket(values) {
    const now = getCurrentTimestamp();
    const requesterId = `USR-${Date.now()}`;

    const newUser = {
      id: requesterId,
      name: values.requesterName.trim(),
      email: values.requesterEmail.trim(),
      role: "requester"
    };

    const ticketId = generateTicketId();
    const newTicket = {
      id: ticketId,
      title: values.title.trim(),
      description: values.description.trim(),
      status: "open",
      priority: values.priority,
      category: values.category,
      createdBy: requesterId,
      assignedTo: "",
      createdAt: now,
      updatedAt: now,
      lastResponseAt: now,
      attachments: attachedFiles.map(function (file) {
        return {
          name: file.name,
          size: file.size,
          type: file.type
        };
      })
    };

    const firstMessage = {
      id: generateMessageId(),
      ticketId,
      senderId: requesterId,
      senderType: "user",
      body: values.description.trim(),
      visibility: "public",
      createdAt: now
    };

    setAppState(function (previous) {
      return {
        ...previous,
        users: [...previous.users, newUser],
        tickets: [newTicket, ...previous.tickets],
        messages: [...previous.messages, firstMessage]
      };
    });

    return ticketId;
  }

  function addReply(ticketId, senderId, senderType, body, visibility) {
    const now = getCurrentTimestamp();
    const newMessage = {
      id: generateMessageId(),
      ticketId,
      senderId,
      senderType,
      body: body.trim(),
      visibility,
      createdAt: now
    };

    setAppState(function (previous) {
      return {
        ...previous,
        messages: [...previous.messages, newMessage],
        tickets: previous.tickets.map(function (ticket) {
          if (ticket.id !== ticketId) return ticket;

          return {
            ...ticket,
            updatedAt: now,
            lastResponseAt: now
          };
        })
      };
    });
  }

  function updateTicketStatus(ticketId, status) {
    const now = getCurrentTimestamp();

    setAppState(function (previous) {
      return {
        ...previous,
        tickets: previous.tickets.map(function (ticket) {
          if (ticket.id !== ticketId) return ticket;

          return {
            ...ticket,
            status,
            updatedAt: now
          };
        })
      };
    });
  }

  function assignTicket(ticketId, assignedTo) {
    const now = getCurrentTimestamp();

    setAppState(function (previous) {
      return {
        ...previous,
        tickets: previous.tickets.map(function (ticket) {
          if (ticket.id !== ticketId) return ticket;

          return {
            ...ticket,
            assignedTo,
            updatedAt: now
          };
        })
      };
    });
  }

  function getInitials(name) {
    if (!name) return "?";
    return name
      .split(" ")
      .map(function (part) {
        return part[0];
      })
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function renderButton(children, onClick, variant, type, extraStyle, className) {
    return (
      <LightButton
        onClick={onClick}
        type={type || "button"}
        className={className || ""}
        style={
          variant === "secondary"
            ? {
                ...(extraStyle || {})
              }
            : {
                background: "#000",
                color: "#fff",
                ...(extraStyle || {})
              }
        }
      >
        {children}
      </LightButton>
    );
  }

  function renderCard(title, subtitle, content, rightContent, onClick, extraClassName) {
    return (
      <div
        className={`card-shell ${onClick ? "card-shell-clickable" : ""} ${extraClassName || ""}`}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? function (event) {
                if (event.key === "Enter" || event.key === " ") {
                  onClick();
                }
              }
            : undefined
        }
      >
        <div className="card-header-row">
          <div>
            <h3 className="card-title">{title}</h3>
            {subtitle ? <div className="card-subtitle">{subtitle}</div> : null}
          </div>
          {rightContent ? <div>{rightContent}</div> : null}
        </div>
        {content ? <div className="card-body">{content}</div> : null}
      </div>
    );
  }

  function renderSelect(label, value, onChange, options, error) {
    return (
      <div className="field-group">
        {label ? <label className="field-label">{label}</label> : null}
        <select className="field-input native-select" value={value} onChange={onChange}>
          {options.map(function (option) {
            return (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            );
          })}
        </select>
        {error ? <div className="field-error">{error}</div> : null}
      </div>
    );
  }

  function renderDashboard() {
    const rows = filteredTickets.map(function (ticket) {
      const requester = getUserById(appState.users, ticket.createdBy);
      const isStale =
        (ticket.priority === "urgent" || ticket.priority === "high") &&
        (Date.now() - new Date(ticket.updatedAt).getTime() > 1000 * 60 * 60 * 24 * 3 ||
          ticket.status === "open");

      return {
        id: ticket.id,
        ticket: (
          <div className="table-ticket-cell">
            <button
              className="link-button"
              onClick={function () {
                setRoute({
                  page: "home",
                  mode: "details",
                  ticketId: ticket.id,
                  justSubmitted: false
                });
              }}
              type="button"
            >
              {ticket.title}
            </button>
            <div className="muted-text">{ticket.id}</div>
            <div className="muted-text">
              Requester: {requester ? requester.name : "Unknown"}
            </div>
            {isStale ? <div className="stale-pill">Needs attention</div> : null}
          </div>
        ),
        status: renderSelect(
          "",
          ticket.status,
          function (event) {
            updateTicketStatus(ticket.id, event.target.value);
          },
          TICKET_STATUSES.map(function (item) {
            return { value: item, label: formatLabel(item) };
          })
        ),
        priority: formatLabel(ticket.priority),
        category: formatLabel(ticket.category),
        assignee: renderSelect(
          "",
          ticket.assignedTo || "",
          function (event) {
            assignTicket(ticket.id, event.target.value);
          },
          [{ value: "", label: "Unassigned" }].concat(
            agents.map(function (agent) {
              return { value: agent.id, label: agent.name };
            })
          )
        ),
        updated: (
          <div>
            <div>{TimeAgo(ticket.updatedAt)}</div>
            <div className="muted-text">{DateFormat(ticket.updatedAt)}</div>
          </div>
        )
      };
    });

    return (
      <div className="stack-lg">
        <div className="stats-grid">
          {renderCard(
            String(stats.total),
            "Total Tickets",
            null,
            null,
            function () {
              openStatusPage("all_tickets", "All Tickets");
            },
            "stats-card"
          )}

          {renderCard(
            String(stats.open),
            "Open",
            null,
            null,
            function () {
              openStatusPage("open", "Open Tickets");
            },
            "stats-card"
          )}

          {renderCard(
            String(stats.inProgress),
            "In Progress",
            null,
            null,
            function () {
              openStatusPage("in_progress", "In Progress Tickets");
            },
            "stats-card"
          )}

          {renderCard(
            String(stats.resolved),
            "Resolved",
            null,
            null,
            function () {
              openStatusPage("resolved", "Resolved Tickets");
            },
            "stats-card"
          )}

          {renderCard(
            String(stats.unassigned),
            "Unassigned",
            null,
            null,
            function () {
              openStatusPage("unassigned", "Unassigned Tickets");
            },
            "stats-card"
          )}
        </div>

        {renderCard(
          "Ticket Filters",
          "Search, organize, and prioritize incoming work",
          <div className="filters-grid">
            <div className="field-group">
              <TextField
                className={"field-input"}
                label={{
                  material: false,
                  content: "Search",
                  className: "field-label ticket-title-label"
                }}
                value={appState.filters.search}
                onChange={function (event) {
                  updateFilters({ search: event.target.value });
                }}
                placeholder={"Search by title, description, or ID"}
              />
            </div>

            {renderSelect(
              "Status",
              appState.filters.status,
              function (event) {
                updateFilters({ status: event.target.value });
              },
              [{ value: "all", label: "All Statuses" }].concat(
                TICKET_STATUSES.map(function (item) {
                  return { value: item, label: formatLabel(item) };
                })
              )
            )}

            {renderSelect(
              "Priority",
              appState.filters.priority,
              function (event) {
                updateFilters({ priority: event.target.value });
              },
              [{ value: "all", label: "All Priorities" }].concat(
                PRIORITIES.map(function (item) {
                  return { value: item, label: formatLabel(item) };
                })
              )
            )}

            {renderSelect(
              "Category",
              appState.filters.category,
              function (event) {
                updateFilters({ category: event.target.value });
              },
              [{ value: "all", label: "All Categories" }].concat(
                CATEGORIES.map(function (item) {
                  return { value: item, label: formatLabel(item) };
                })
              )
            )}

            {renderSelect(
              "Assignee",
              appState.filters.assignee,
              function (event) {
                updateFilters({ assignee: event.target.value });
              },
              [
                { value: "all", label: "All Assignees" },
                { value: "unassigned", label: "Unassigned" }
              ].concat(
                agents.map(function (agent) {
                  return { value: agent.id, label: agent.name };
                })
              )
            )}

            {renderSelect(
              "Sort By",
              appState.filters.sortBy,
              function (event) {
                updateFilters({ sortBy: event.target.value });
              },
              getSortOptions()
            )}
          </div>,
          renderButton("Reset Filters", resetFilters, "secondary"),
          null,
          "filters-card"
        )}

        {renderCard(
          "Ticket Management Dashboard",
          "Operational queue for support staff",
          <div className="table-shell-inner">
            <table className="ticket-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Category</th>
                  <th>Assignee</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(function (row) {
                  return (
                    <tr key={row.id}>
                      <td>{row.ticket}</td>
                      <td>{row.status}</td>
                      <td>{row.priority}</td>
                      <td>{row.category}</td>
                      <td>{row.assignee}</td>
                      <td>{row.updated}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>,
          null,
          null,
          "dashboard-card"
        )}
      </div>
    );
  }

  function renderStatusListPage() {
    return (
      <div className="stack-lg">
        <div className="home-top-actions">
          {renderButton(
            "Back to Dashboard",
            function () {
              setRoute({
                page: "home",
                mode: "dashboard",
                ticketId: null,
                statusFilter: null,
                statusTitle: null,
                justSubmitted: false
              });
            },
            "secondary",
            "button",
            {
              background: "#000",
              color: "#fff"
            },
            "form-action-button"
          )}
        </div>

        {renderCard(
          route.statusTitle || "Tickets",
          `${statusPageTickets.length} ticket(s) found`,
          <div className="table-shell-inner">
            <table className="ticket-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Category</th>
                  <th>Assignee</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {statusPageTickets.map(function (ticket) {
                  const requester = getUserById(appState.users, ticket.createdBy);
                  const assignee = getUserById(appState.users, ticket.assignedTo);

                  return (
                    <tr key={ticket.id}>
                      <td>
                        <div className="table-ticket-cell">
                          <button
                            className="link-button"
                            onClick={function () {
                              setRoute({
                                page: "home",
                                mode: "details",
                                ticketId: ticket.id,
                                statusFilter: route.statusFilter,
                                statusTitle: route.statusTitle,
                                justSubmitted: false
                              });
                            }}
                            type="button"
                          >
                            {ticket.title}
                          </button>
                          <div className="muted-text">{ticket.id}</div>
                          <div className="muted-text">
                            Requester: {requester ? requester.name : "Unknown"}
                          </div>
                        </div>
                      </td>

                      <td>{formatLabel(ticket.status)}</td>
                      <td>{formatLabel(ticket.priority)}</td>
                      <td>{formatLabel(ticket.category)}</td>
                      <td>{assignee ? assignee.name : "Unassigned"}</td>
                      <td>
                        <div>{TimeAgo(ticket.updatedAt)}</div>
                        <div className="muted-text">{DateFormat(ticket.updatedAt)}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {statusPageTickets.length === 0 ? (
              <div className="empty-state">No tickets found for this category.</div>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  function handleCreateTicketSubmit(event) {
    event.preventDefault();
    const errors = validateTicketInput(ticketForm);
    setTicketErrors(errors);

    if (Object.keys(errors).length > 0) return;

    const ticketId = createTicket(ticketForm);
    setTicketForm(INITIAL_FORM);
    setTicketErrors({});
    setAttachedFiles([]);

    setRoute({
      page: "home",
      mode: "details",
      ticketId: ticketId,
      statusFilter: null,
      statusTitle: null,
      justSubmitted: true
    });
  }

  function renderCreateTicket() {
    return renderCard(
      "Create Support Ticket",
      "Capture clear issue details for faster triage and resolution",
      <form className="stack-lg" onSubmit={handleCreateTicketSubmit}>
        <div className="field-group">
          <TextField
            className={"field-input"}
            label={{
              material: false,
              content: "Ticket Title",
              className: "field-label ticket-title-label"
            }}
            value={ticketForm.title}
            onChange={function (event) {
              setTicketForm(function (previous) {
                return { ...previous, title: event.target.value };
              });
            }}
            placeholder={"Briefly describe the issue"}
          />
          {ticketErrors.title ? <div className="field-error">{ticketErrors.title}</div> : null}
        </div>

        <div className="field-group">
          <TextAreaField
            className={"field-input"}
            label={{
              material: false,
              content: "Issue Description",
              className: "field-label ticket-title-label"
            }}
            value={ticketForm.description}
            onChange={function (event) {
              setTicketForm(function (previous) {
                return { ...previous, description: event.target.value };
              });
            }}
            placeholder={
              "Add context, reproduction steps, observed behavior, and expected behavior"
            }
            resize
          />
          {ticketErrors.description ? (
            <div className="field-error">{ticketErrors.description}</div>
          ) : null}
        </div>

        <div className="two-col-grid">
          {renderSelect(
            "Category",
            ticketForm.category,
            function (event) {
              setTicketForm(function (previous) {
                return { ...previous, category: event.target.value };
              });
            },
            [{ value: "", label: "Select Category" }].concat(
              CATEGORIES.map(function (item) {
                return { value: item, label: formatLabel(item) };
              })
            ),
            ticketErrors.category
          )}

          {renderSelect(
            "Priority",
            ticketForm.priority,
            function (event) {
              setTicketForm(function (previous) {
                return { ...previous, priority: event.target.value };
              });
            },
            [{ value: "", label: "Select Priority" }].concat(
              PRIORITIES.map(function (item) {
                return { value: item, label: formatLabel(item) };
              })
            ),
            ticketErrors.priority
          )}
        </div>

        <div className="two-col-grid">
          <div className="field-group">
            <TextField
              className={"field-input"}
              label={{
                material: false,
                content: "Requester Name",
                className: "field-label ticket-title-label"
              }}
              value={ticketForm.requesterName}
              onChange={function (event) {
                setTicketForm(function (previous) {
                  return { ...previous, requesterName: event.target.value };
                });
              }}
              placeholder={"Jane Doe"}
            />
            {ticketErrors.requesterName ? (
              <div className="field-error">{ticketErrors.requesterName}</div>
            ) : null}
          </div>

          <div className="field-group">
            <TextField
              className={"field-input"}
              label={{
                material: false,
                content: "Requester Email",
                className: "field-label ticket-title-label"
              }}
              value={ticketForm.requesterEmail}
              onChange={function (event) {
                setTicketForm(function (previous) {
                  return { ...previous, requesterEmail: event.target.value };
                });
              }}
              placeholder={"jane@company.com"}
            />
            {ticketErrors.requesterEmail ? (
              <div className="field-error">{ticketErrors.requesterEmail}</div>
            ) : null}
          </div>
        </div>

        <div className="field-group">
          <label className="field-label">Attachments</label>

          <div className="attachment-upload-row">
            <label className="attach-button" htmlFor="ticket-attachment-input">
              Attach Files
            </label>

            <input
              id="ticket-attachment-input"
              type="file"
              multiple
              className="hidden-file-input"
              onChange={function (event) {
                const files = Array.from(event.target.files || []);
                setAttachedFiles(files);
              }}
            />
          </div>

          {attachedFiles.length > 0 ? (
            <div className="attachment-list">
              {attachedFiles.map(function (file, index) {
                return (
                  <div key={index} className="attachment-chip">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      className="attachment-remove"
                      onClick={function () {
                        setAttachedFiles(function (previous) {
                          return previous.filter(function (_, fileIndex) {
                            return fileIndex !== index;
                          });
                        });
                      }}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="muted-text">No files attached</div>
          )}
        </div>

        <div className="action-row">
          {renderButton(
            "Cancel",
            function () {
              setRoute({
                page: "home",
                mode: "dashboard",
                ticketId: null,
                justSubmitted: false
              });
            },
            "secondary",
            "button",
            {
              background: "#000",
              color: "#fff"
            },
            "form-action-button"
          )}

          {renderButton(
            "Submit Ticket",
            null,
            "primary",
            "submit",
            {
              background: "#000",
              color: "#fff"
            },
            "form-action-button"
          )}
        </div>
      </form>,
      null,
      null,
      "create-ticket-card"
    );
  }

  function handleReplySubmit(event) {
    event.preventDefault();
    const error = validateReplyForm(replyForm.body);
    setReplyError(error);

    if (error || !selectedTicket) return;

    addReply(
      selectedTicket.id,
      replyForm.senderId,
      "support",
      replyForm.body,
      replyForm.visibility
    );

    setReplyForm(function (previous) {
      return {
        ...previous,
        body: ""
      };
    });
    setReplyError("");
  }

  function renderTimeline(items) {
    return (
      <div className="timeline">
        {items.map(function (item) {
          return (
            <div key={item.id} className="timeline-item">
              <div className="timeline-item-header">
                <strong>{item.title}</strong>
                <span className="pill">{item.badge}</span>
              </div>
              <div className="muted-text">{item.date}</div>
              <div className="body-copy">{item.description}</div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderTicketDetails() {
    if (!selectedTicket) {
      return renderCard(
        "Ticket not found",
        "The selected ticket could not be located",
        <div className="action-row">
          {renderButton("Return", function () {
            if (route.statusFilter) {
              setRoute({
                page: "home",
                mode: "statusList",
                ticketId: null,
                statusFilter: route.statusFilter,
                statusTitle: route.statusTitle,
                justSubmitted: false
              });
              return;
            }

            setRoute({
              page: "home",
              mode: "dashboard",
              ticketId: null,
              statusFilter: null,
              statusTitle: null,
              justSubmitted: false
            });
          })}
        </div>
      );
    }

    const requester = getUserById(appState.users, selectedTicket.createdBy);
    const assignee = getUserById(appState.users, selectedTicket.assignedTo);

    const timelineItems = selectedMessages.map(function (message) {
      const sender = getUserById(appState.users, message.senderId);

      return {
        id: message.id,
        title:
          (sender ? sender.name : "Unknown") +
          " • " +
          (message.senderType === "support" ? "Support" : "Requester"),
        description: message.body,
        date: DateFormat(message.createdAt),
        badge: message.visibility === "internal" ? "Internal Note" : "Public Reply"
      };
    });

    return (
      <div className="stack-lg">
        {renderCard(
          selectedTicket.title,
          selectedTicket.id + " • Created " + DateFormat(selectedTicket.createdAt),
          <div>
            <div className="ticket-header-meta">
              <span className={getStatusPillClass(selectedTicket.status)}>
                {formatLabel(selectedTicket.status)}
              </span>
              <span className="pill">{formatLabel(selectedTicket.priority)}</span>
              <span className="pill">{formatLabel(selectedTicket.category)}</span>
            </div>
            <p className="body-copy">{selectedTicket.description}</p>
          </div>,
          renderButton(
            "Back",
            function () {
              if (route.statusFilter) {
                setRoute({
                  page: "home",
                  mode: "statusList",
                  ticketId: null,
                  statusFilter: route.statusFilter,
                  statusTitle: route.statusTitle,
                  justSubmitted: false
                });
                return;
              }

              setRoute({
                page: "home",
                mode: "dashboard",
                ticketId: null,
                statusFilter: null,
                statusTitle: null,
                justSubmitted: false
              });
            },
            "secondary",
            "button",
            {
              background: "#000",
              color: "#fff"
            },
            "form-action-button"
          )
        )}

        <div className="details-grid">
          <div className="stack-lg">
            {renderCard(
              "Conversation History",
              "User and support conversation timeline",
              renderTimeline(timelineItems)
            )}

            {!route.justSubmitted
              ? renderCard(
                  "Add Support Response",
                  "Post a public reply or internal note",
                  <form className="stack-lg" onSubmit={handleReplySubmit}>
                    <div className="two-col-grid">
                      {renderSelect(
                        "Send As",
                        replyForm.senderId,
                        function (event) {
                          setReplyForm(function (previous) {
                            return { ...previous, senderId: event.target.value };
                          });
                        },
                        agents.map(function (agent) {
                          return { value: agent.id, label: agent.name };
                        })
                      )}

                      {renderSelect(
                        "Visibility",
                        replyForm.visibility,
                        function (event) {
                          setReplyForm(function (previous) {
                            return { ...previous, visibility: event.target.value };
                          });
                        },
                        [
                          { value: "public", label: "Public Reply" },
                          { value: "internal", label: "Internal Note" }
                        ]
                      )}
                    </div>

                    <div className="field-group">
                      <TextAreaField
                        className={"field-input"}
                        label={{
                          material: false,
                          content: "Message",
                          className: "field-label"
                        }}
                        value={replyForm.body}
                        onChange={function (event) {
                          setReplyForm(function (previous) {
                            return { ...previous, body: event.target.value };
                          });
                        }}
                        placeholder={
                          "Add troubleshooting updates, resolution steps, or internal context"
                        }
                        resize
                      />
                      {replyError ? <div className="field-error">{replyError}</div> : null}
                    </div>

                    <div className="action-row">
                      {renderButton(
                        "Post Response",
                        null,
                        "primary",
                        "submit",
                        {
                          background: "#000",
                          color: "#fff"
                        }
                      )}
                    </div>
                  </form>
                )
              : null}
          </div>

          {renderCard(
            "Ticket Details",
            "Support workflow metadata",
            <div className="stack-md">
              <div className="meta-block">
                <div className="meta-label">Requester</div>
                <div className="avatar-row">
                  <div className="avatar-circle">
                    {getInitials(requester ? requester.name : "Unknown")}
                  </div>
                  <div>
                    <div>{requester ? requester.name : "Unknown"}</div>
                    <div className="muted-text">{requester ? requester.email : "—"}</div>
                  </div>
                </div>
              </div>

              <div className="meta-block">
                <div className="meta-label">Status</div>
                {renderSelect(
                  "",
                  selectedTicket.status,
                  function (event) {
                    updateTicketStatus(selectedTicket.id, event.target.value);
                  },
                  TICKET_STATUSES.map(function (item) {
                    return { value: item, label: formatLabel(item) };
                  })
                )}
              </div>

              <div className="meta-block">
                <div className="meta-label">Assignee</div>
                {renderSelect(
                  "",
                  selectedTicket.assignedTo || "",
                  function (event) {
                    assignTicket(selectedTicket.id, event.target.value);
                  },
                  [{ value: "", label: "Unassigned" }].concat(
                    agents.map(function (agent) {
                      return { value: agent.id, label: agent.name };
                    })
                  )
                )}
                <div className="muted-text">
                  {assignee ? assignee.name : "No assignee yet"}
                </div>
              </div>

              <div className="meta-block">
                <div className="meta-label">Priority</div>
                <div>{formatLabel(selectedTicket.priority)}</div>
              </div>

              <div className="meta-block">
                <div className="meta-label">Category</div>
                <div>{formatLabel(selectedTicket.category)}</div>
              </div>

              <div className="meta-block">
                <div className="meta-label">Attachments</div>
                {selectedTicket.attachments && selectedTicket.attachments.length > 0 ? (
                  <div className="attachment-list">
                    {selectedTicket.attachments.map(function (file, index) {
                      return (
                        <div key={index} className="attachment-chip attachment-chip-static">
                          <span>{file.name}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="muted-text">No attachments uploaded</div>
                )}
              </div>

              <div className="meta-block">
                <div className="meta-label">Created</div>
                <div>{DateFormat(selectedTicket.createdAt)}</div>
              </div>

              <div className="meta-block">
                <div className="meta-label">Last Updated</div>
                <div>{DateFormat(selectedTicket.updatedAt)}</div>
                <div className="muted-text">{TimeAgo(selectedTicket.updatedAt)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navigation setRoute={setRoute} currentPage="home" route={route} />

      <main className="page-content">
        {route.mode === "create" ? renderCreateTicket() : null}
        {route.mode === "details" ? renderTicketDetails() : null}
        {route.mode === "statusList" ? renderStatusListPage() : null}
        {!route.mode || route.mode === "dashboard" ? renderDashboard() : null}
      </main>

      <Footer />
    </div>
  );
}

export default Home;