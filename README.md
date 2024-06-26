# Email Automation Tool

## Overview

This project is an email automation tool that integrates with Gmail and Outlook to categorize incoming emails and send automated replies based on their content.

### Features

- OAuth integration for Gmail and Outlook
- Email categorization using OpenAI
- Automated email responses
- Task scheduling with BullMQ

## Setup Instructions

1. **Clone the Repository**

    ```bash
    git clone https://github.com/your-repo/email-automation-tool.git
    cd email-automation-tool
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **Configure Environment Variables**

    Create a `.env` file in the root of the project with the following content:

    ```env
    GMAIL_CLIENT_ID=your-gmail-client-id
    GMAIL_CLIENT_SECRET=your-gmail-client-secret
    GMAIL_REDIRECT_URI=http://localhost:3000/oauth2callback

    OUTLOOK_CLIENT_ID=your-outlook-client-id
    OUTLOOK_CLIENT_SECRET=your-outlook-client-secret
    OUTLOOK_REDIRECT_URI=http://localhost:3000/callback

    OPENAI_API_KEY=your-openai-api-key

    REDIS_HOST=localhost
    REDIS_PORT=6379
    ```

4. **Run the Development Server**

    Start the server to handle OAuth flow and run the email processing logic.

    ```bash
    npm start
    ```

5. **Access the OAuth Flow**

    Open your browser and navigate to `http://localhost:3000/auth` for Gmail and `http://localhost:3000/auth/outlook` for Outlook.

6. **Schedule and Process Emails**

    The tool uses BullMQ to fetch and process emails periodically. The default schedule is set to every 5 minutes. Ensure that your Redis server is running:

    ```bash
    redis-server
    ```

    The BullMQ worker will start automatically with the server and handle the scheduled tasks.

## Usage

- After authenticating with Gmail and Outlook, the tool will start fetching emails and categorizing them.
- Emails will be analyzed and categorized as:
    - `Interested`
    - `Not Interested`
    - `More Information`
- Based on the categorization, the tool will generate and send an automated reply.

## Technical Details

### Gmail and Outlook OAuth Integration

- The tool uses OAuth 2.0 to securely access the user's Gmail and Outlook accounts.
- The OAuth tokens are used to fetch emails and send responses.

### Email Context Analysis

- OpenAI's API is used to analyze the content of the emails and categorize them accordingly.

### Automated Responses

- Automated responses are generated using OpenAI, ensuring contextually appropriate replies.

### Task Scheduling

- BullMQ is used to schedule tasks such as fetching new emails and processing them periodically.
- The tasks are added to a queue and processed by a worker.

## Demo Instructions

1. **Connect a New Email Account**

    - Navigate to `/auth` for Gmail and `/auth/outlook` for Outlook.
    - Complete the OAuth flow to authenticate the email account.

2. **Send a Test Email**

    - Use another email account to send test emails to the connected Gmail or Outlook account.

3. **Categorize and Respond**

    - The tool will automatically fetch the new emails, analyze them, and categorize them.
    - An appropriate reply will be generated and sent automatically.

4. **View Automated Responses**

    - Check the sent items of the connected account to view the automated responses.

## Contributing

Feel free to submit issues, forks, and pull requests to improve this tool.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.
