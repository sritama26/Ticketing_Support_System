export const STORAGE_KEY = "meeedly-support-ticket-state";

export const TICKET_STATUSES = ["open", "in_progress", "resolved"];

export const PRIORITIES = ["low", "medium", "high", "urgent"];

export const CATEGORIES = [
  "billing",
  "authentication",
  "technical_issue",
  "feature_request",
  "performance",
  "access_control"
];

export const DEFAULT_FILTERS = {
  search: "",
  status: "all",
  priority: "all",
  category: "all",
  assignee: "all",
  sortBy: "newest"
};

export const INITIAL_FORM = {
  title: "",
  description: "",
  category: "",
  priority: "",
  requesterName: "",
  requesterEmail: ""
};

export function formatLabel(value) {
  if (!value) return "";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });
}

export function getDashboardColumns() {
  return [
    { header: "Ticket", accessor: "ticket" },
    { header: "Status", accessor: "status" },
    { header: "Priority", accessor: "priority" },
    { header: "Category", accessor: "category" },
    { header: "Assignee", accessor: "assignee" },
    { header: "Last Updated", accessor: "updated" }
  ];
}

export function getSortOptions() {
  return [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "stale", label: "Stale First" },
    { value: "priority", label: "Priority" }
  ];
}

export function validateTicketInput(values) {
  const errors = {};

  if (!values.title.trim()) {
    errors.title = "Title is required.";
  }

  if (!values.description.trim()) {
    errors.description = "Description is required.";
  }

  if (!values.category.trim()) {
    errors.category = "Category is required.";
  }

  if (!values.priority.trim()) {
    errors.priority = "Priority is required.";
  }

  if (!values.requesterName.trim()) {
    errors.requesterName = "Requester name is required.";
  }

  if (!values.requesterEmail.trim()) {
    errors.requesterEmail = "Requester email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.requesterEmail.trim())) {
    errors.requesterEmail = "Enter a valid email address.";
  }

  return errors;
}

export function validateReplyForm(value) {
  if (!value.trim()) {
    return "Reply cannot be empty.";
  }

  return "";
}

export function generateTicketId() {
  return `TCK-${Math.floor(1000 + Math.random() * 9000)}-${Date.now()}`;
}

export function generateMessageId() {
  return `MSG-${Math.floor(1000 + Math.random() * 9000)}-${Date.now()}`;
}

export function getCurrentTimestamp() {
  return new Date().toISOString();
}

export function getUserById(users, userId) {
  return (
    users.find(function (user) {
      return user.id === userId;
    }) || null
  );
}

export function getTicketMessages(messages, ticketId) {
  return messages
    .filter(function (message) {
      return message.ticketId === ticketId;
    })
    .sort(function (a, b) {
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
}

export function getFilteredTickets(tickets, filters) {
  const { search, status, priority, category, assignee, sortBy } = filters;
  let result = [...tickets];

  if (search.trim()) {
    const query = search.toLowerCase().trim();

    result = result.filter(function (ticket) {
      return (
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        ticket.id.toLowerCase().includes(query)
      );
    });
  }

  if (status !== "all") {
    result = result.filter(function (ticket) {
      return ticket.status === status;
    });
  }

  if (priority !== "all") {
    result = result.filter(function (ticket) {
      return ticket.priority === priority;
    });
  }

  if (category !== "all") {
    result = result.filter(function (ticket) {
      return ticket.category === category;
    });
  }

  if (assignee !== "all") {
    if (assignee === "unassigned") {
      result = result.filter(function (ticket) {
        return !ticket.assignedTo;
      });
    } else {
      result = result.filter(function (ticket) {
        return ticket.assignedTo === assignee;
      });
    }
  }

  result.sort(function (a, b) {
    if (sortBy === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }

    if (sortBy === "stale") {
      return new Date(a.updatedAt) - new Date(b.updatedAt);
    }

    if (sortBy === "priority") {
      const priorityOrder = {
        urgent: 4,
        high: 3,
        medium: 2,
        low: 1
      };

      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }

    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return result;
}

export function getTicketStats(tickets) {
  return {
    total: tickets.length,
    open: tickets.filter(function (ticket) {
      return ticket.status === "open";
    }).length,
    inProgress: tickets.filter(function (ticket) {
      return ticket.status === "in_progress";
    }).length,
    resolved: tickets.filter(function (ticket) {
      return ticket.status === "resolved";
    }).length,
    unassigned: tickets.filter(function (ticket) {
      return !ticket.assignedTo;
    }).length
  };
}

export function loadTicketSystemState() {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch (error) {
    return null;
  }
}

export function saveTicketSystemState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // ignore storage failures safely
  }
}

export function getSeedState() {
  return {
    users: [
      {
        id: "USR-100",
        name: "Maya Chen",
        email: "maya@acme.com",
        role: "requester"
      },
      {
        id: "USR-101",
        name: "Noah Patel",
        email: "noah@northgrid.com",
        role: "requester"
      },
      {
        id: "USR-102",
        name: "Ava Smith",
        email: "ava@bayshop.com",
        role: "requester"
      },
      {
        id: "AGENT-1",
        name: "Alice Johnson",
        email: "alice@meeedly.com",
        role: "support_agent"
      },
      {
        id: "AGENT-2",
        name: "Brian Lee",
        email: "brian@meeedly.com",
        role: "support_agent"
      },
      {
        id: "AGENT-3",
        name: "Carla Gomez",
        email: "carla@meeedly.com",
        role: "support_agent"
      }
    ],

    tickets: [
      {
        id: "TCK-1001",
        title: "Unable to access billing dashboard",
        description: "Receiving a 403 error when opening the billing page.",
        status: "open",
        priority: "high",
        category: "billing",
        createdBy: "USR-100",
        assignedTo: "AGENT-1",
        createdAt: "2026-03-29T09:20:00.000Z",
        updatedAt: "2026-03-29T10:20:00.000Z",
        lastResponseAt: "2026-03-29T10:20:00.000Z"
      },
      {
        id: "TCK-1002",
        title: "Two-factor authentication code not delivered",
        description: "SMS code does not arrive after repeated attempts.",
        status: "in_progress",
        priority: "urgent",
        category: "authentication",
        createdBy: "USR-101",
        assignedTo: "AGENT-2",
        createdAt: "2026-03-28T13:00:00.000Z",
        updatedAt: "2026-03-31T15:20:00.000Z",
        lastResponseAt: "2026-03-31T15:20:00.000Z"
      },
      {
        id: "TCK-1003",
        title: "Report export is timing out",
        description: "Quarterly report export stalls after 30 seconds.",
        status: "open",
        priority: "medium",
        category: "performance",
        createdBy: "USR-102",
        assignedTo: "",
        createdAt: "2026-03-25T08:15:00.000Z",
        updatedAt: "2026-03-25T08:15:00.000Z",
        lastResponseAt: "2026-03-25T08:15:00.000Z"
      },
      {
        id: "TCK-1004",
        title: "Need permission to manage team members",
        description: "Admin panel does not show member management actions.",
        status: "resolved",
        priority: "low",
        category: "access_control",
        createdBy: "USR-100",
        assignedTo: "AGENT-3",
        createdAt: "2026-03-24T11:40:00.000Z",
        updatedAt: "2026-03-26T12:10:00.000Z",
        lastResponseAt: "2026-03-26T12:10:00.000Z"
      },
      {
        id: "TCK-1005",
        title: "Feature request for bulk ticket export",
        description: "Would like a CSV export for all support tickets.",
        status: "open",
        priority: "medium",
        category: "feature_request",
        createdBy: "USR-101",
        assignedTo: "",
        createdAt: "2026-03-23T16:10:00.000Z",
        updatedAt: "2026-03-27T09:30:00.000Z",
        lastResponseAt: "2026-03-27T09:30:00.000Z"
      },
      {
        id: "TCK-1006",
        title: "App crashes after saving draft",
        description: "The application exits unexpectedly when I save a draft response.",
        status: "in_progress",
        priority: "high",
        category: "technical_issue",
        createdBy: "USR-102",
        assignedTo: "AGENT-1",
        createdAt: "2026-03-22T10:05:00.000Z",
        updatedAt: "2026-03-30T17:00:00.000Z",
        lastResponseAt: "2026-03-30T17:00:00.000Z"
      }
    ],

    messages: [
      {
        id: "MSG-1001",
        ticketId: "TCK-1001",
        senderId: "USR-100",
        senderType: "user",
        body: "I get a 403 every time I open billing.",
        visibility: "public",
        createdAt: "2026-03-29T09:20:00.000Z"
      },
      {
        id: "MSG-1002",
        ticketId: "TCK-1001",
        senderId: "AGENT-1",
        senderType: "support",
        body: "We are checking your account permissions now.",
        visibility: "public",
        createdAt: "2026-03-29T10:20:00.000Z"
      },
      {
        id: "MSG-1003",
        ticketId: "TCK-1002",
        senderId: "USR-101",
        senderType: "user",
        body: "I cannot log in because the SMS code never arrives.",
        visibility: "public",
        createdAt: "2026-03-28T13:00:00.000Z"
      },
      {
        id: "MSG-1004",
        ticketId: "TCK-1002",
        senderId: "AGENT-2",
        senderType: "support",
        body: "We have escalated this to our authentication provider.",
        visibility: "public",
        createdAt: "2026-03-31T15:20:00.000Z"
      },
      {
        id: "MSG-1005",
        ticketId: "TCK-1004",
        senderId: "USR-100",
        senderType: "user",
        body: "I need access to manage team members for our org.",
        visibility: "public",
        createdAt: "2026-03-24T11:40:00.000Z"
      },
      {
        id: "MSG-1006",
        ticketId: "TCK-1004",
        senderId: "AGENT-3",
        senderType: "support",
        body: "Access was enabled after role review. Please confirm.",
        visibility: "public",
        createdAt: "2026-03-26T12:10:00.000Z"
      },
      {
        id: "MSG-1007",
        ticketId: "TCK-1006",
        senderId: "USR-102",
        senderType: "user",
        body: "The app closes whenever I save a draft reply.",
        visibility: "public",
        createdAt: "2026-03-22T10:05:00.000Z"
      },
      {
        id: "MSG-1008",
        ticketId: "TCK-1006",
        senderId: "AGENT-1",
        senderType: "support",
        body: "We reproduced the bug and are working on a fix.",
        visibility: "public",
        createdAt: "2026-03-30T17:00:00.000Z"
      }
    ],

    filters: { ...DEFAULT_FILTERS }
  };
}