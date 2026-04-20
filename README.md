# GraphQL Server

## Project Setup Guide

This README provides the necessary steps to configure the database environment and initialize the application schema.

## Prerequisites

Docker & Docker Compose: Latest stable

## Database Configuration

The project utilizes PGAdmin for database management. Follow these steps to connect to the local PostgreSQL instance:

### 0. Run Supporting Docker Images

```Bash
# Run
docker compose up -d --build
```

**Navigate** to <http://localhost:50057/graphql>.
for local development you will need to create a .env with the below inside

```Bash
DATABASE_URL=postgresql://admin:password@localhost:5432/lush
```

### 1. Access PGAdmin

Open your browser and navigate to: <http://localhost:8083/browser/>

#### Login Credentials

- **Username:** admin

- **Password:** password

### 2. Register Server

In the Quick Links pane, click on **Add New Server**.

Under the _General_ tab:

**Name:** lush

Under the _Connection_ tab:

- **Host name/address:** postgres

- **Port:** 5432

- **Password:** password

Click Save.

## Application Setup (Local Setup)

The docker image of the task service migrates and seeds the database,
if you are testing locally you'll need to do this yourself, you can at least launch the postgres container and pgadmin.

Once the database is accessible,

```Bash
npm run generate
```

and then populate the columns and rows with task with

```Bash
# Generate Prisma Client
npm run seed

# Generate Prisma Client
npm run seed
```

## Usage & API Queries

You can interact with the GraphQL API using the following example query structure:

#### Fetch a Specific Task

```GraphQL
query GetTask{
  task(id: "task-1") {
    id
    title
    completed
    createdAt
    updatedAt
  }
}


query GetTasks{
  tasks {
    id
    title
    completed
    createdAt
    updatedAt
  }
}

query GetAllTasks {
  tasksByCursor(first: 10) {
    edges {
      cursor
      node {
        id
        title
        completed
        createdAt
        updatedAt
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}

mutation CreateTask {
  addTask(title: "Learn Pothos!") {
    id
    title
    completed

  }
}

mutation toggleTask {
  toggleTask(id: "task-2") {
    id
    title
    completed
  }
}

mutation RemoveTask {
  deleteTask(id: "60e8bf89-87ad-4f16-809a-e6216a4003ab") {
    id
    title
    completed
  }
}
```
