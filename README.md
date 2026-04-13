# Ticketing System
# Setup Instructions
First, go to the project directory:

cd Ticketing_Support_System-main

In the project directory, run:
### `npm i`
### `npm start`

Runs the app in development mode.  
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

In the project directory,  run:

### `npm start`

Starts the development server.

## Features

- Create support tickets
- View ticket details
- Filter tickets by status, priority, category, and assignee
- Dashboard with ticket statistics
- Status-based ticket pages
- Attach files while creating tickets
- Support response section for existing tickets

### Dashboard

The dashboard shows:
- Total tickets
- Open tickets
- In Progress tickets
- Resolved tickets
- Unassigned tickets

Each card routes to a filtered ticket list page.

### Create Support Ticket

Users can:
- Enter ticket title
- Add issue description
- Select category
- Select priority
- Add requester name and email
- Attach files

After submission, the app routes to the details page of the newly created ticket.

### Ticket Details

The details page shows:
- Ticket metadata
- Requester information
- Status
- Assignee
- Category
- Priority
- Attachments
- Conversation history

### Different Filters

The filters section supports:
- Search
- Status
- Priority
- Category
- Assignee
- Sort options
