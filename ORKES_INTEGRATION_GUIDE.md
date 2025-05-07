# NeuroVichar & Orkes Cloud Integration Guide

This guide outlines the steps to integrate Orkes Cloud (Netflix Conductor) with your NeuroVichar project to orchestrate AI agents for the Neuro Synapse feature.

## Prerequisites

1.  **Node.js and npm/yarn:** For running the NeuroVichar Next.js application.
2.  **Orkes Cloud Account:**
    *   Sign up for a free Orkes Cloud Playground account at [https://orkes.io/cloud](https://orkes.io/cloud) or use your existing enterprise account.
3.  **ngrok:** To expose your local NeuroVichar agent API endpoints to the internet so Orkes Cloud can call them. Download from [https://ngrok.com/download](https://ngrok.com/download).

## Step 1: Configure Orkes Cloud

1.  **Log in to Orkes Cloud Console.**
2.  **Create an Application (if you don't have one):**
    *   Navigate to "Applications" and click "Create Application".
    *   Give it a name (e.g., `NeuroVicharApp`).
3.  **Get API Keys:**
    *   Go to "Applications" -> Select your application.
    *   Under the "Access Keys" tab, click "Create Access Key".
    *   Provide a name (e.g., `neurovichar_sdk_key`).
    *   **Important:** Copy the `Key ID` and `Key Secret` immediately. The Key Secret will not be shown again.
4.  **Note your Orkes Server URL:**
    *   This is typically found in your Orkes Cloud console, often in the format `https://<your-org-name>.orkesconductor.io/api` for dedicated clusters or `https://play.orkes.io/api` for the playground.

## Step 2: Configure NeuroVichar Project

1.  **Update Environment Variables:**
    *   Create or open the `.env` (or `.env.local`) file in the root of your NeuroVichar project.
    *   Add your Orkes Cloud details:
        ```env
        ORKES_SERVER_URL="https://your-orkes-server-url/api"
        ORKES_KEY_ID="your_copied_key_id"
        ORKES_KEY_SECRET="your_copied_key_secret"
        NGROK_BASE_URL="http://localhost:9002" # This will be updated in Step 3
        ```
    *   Replace placeholders with your actual Orkes server URL, Key ID, and Key Secret.

## Step 3: Expose Local Agent Endpoints with ngrok

Your NeuroVichar application runs AI agent logic as API routes (e.g., `/api/agents/analyzer`). Orkes Cloud needs to be able to reach these endpoints over the internet.

1.  **Start your NeuroVichar application:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    This typically starts the app on `http://localhost:9002` (as per your `package.json`).

2.  **Start ngrok:**
    *   Open a new terminal window.
    *   Run ngrok to expose your local port (e.g., 9002):
        ```bash
        ngrok http 9002
        ```
    *   ngrok will display a forwarding URL, like `https://xxxx-yyy-zzz.ngrok-free.app` or similar.
    *   **Copy this HTTPS URL.**

3.  **Update `NGROK_BASE_URL` in your `.env` file:**
    ```env
    NGROK_BASE_URL="https://xxxx-yyy-zzz.ngrok-free.app" # Replace with your ngrok URL
    ```
4.  **Restart your NeuroVichar application** if it was already running to pick up the new `NGROK_BASE_URL`.

**Important:** The ngrok URL is temporary and changes each time you restart ngrok (unless you have a paid ngrok plan with a custom subdomain). You'll need to update `NGROK_BASE_URL` and potentially your Orkes workflow definitions if the ngrok URL changes.

## Step 4: Define Tasks in Orkes Conductor

The `neuro-synapse-orkes-workflow.yaml` file references several HTTP tasks (e.g., `analyze_prompt`, `plan_execution`). You need to define these tasks in Orkes Conductor.

1.  **Log in to Orkes Cloud Console.**
2.  Navigate to **Definitions > Task Definitions**.
3.  Click **"Define Task"** for each task mentioned in the workflow YAML.
    *   **Task Name:** Must exactly match the `name` field in the YAML task definition (e.g., `analyze_prompt`).
    *   **Retry Count:** e.g., `2` (as in YAML)
    *   **Retry Logic:** `FIXED` (as in YAML)
    *   **Retry Delay Seconds:** e.g., `10` (as in YAML)
    *   **Timeout Seconds:** e.g., `60` (as in YAML)
    *   **Timeout Policy:** `TIME_OUT_WF` (Workflow times out if task times out) or `RETRY` as per your needs.
    *   **Response Timeout Seconds:** e.g., `60`
    *   **Owner Email:** `dev@neurovichar.ai` (or your email)

    **Example Task Definition (JSON format for Orkes UI import or manual entry):**
    For `analyze_prompt`:
    ```json
    {
      "name": "analyze_prompt",
      "description": "Analyzes the user prompt using NeuroVichar's Analyzer agent.",
      "retryCount": 2,
      "retryLogic": "FIXED",
      "retryDelaySeconds": 10,
      "timeoutSeconds": 60,
      "timeoutPolicy": "TIME_OUT_WF",
      "responseTimeoutSeconds": 60,
      "ownerEmail": "dev@neurovichar.ai",
      "inputKeys": ["http_request"],
      "outputKeys": ["response"]
    }
    ```
    Repeat this for all tasks: `plan_execution`, `execute_code_generation_task`, `execute_image_generation_task`, `execute_evaluation_task`, `ethical_check`, `synthesize_final_result`.
    The `handle_ethical_failure` task is a `TERMINATE` task and doesn't need a separate task definition in the same way HTTP tasks do, as its behavior is defined in the workflow.

## Step 5: Upload Workflow Definition to Orkes Cloud

1.  Navigate to **Definitions > Workflow Definitions** in the Orkes Cloud Console.
2.  Click **"Define Workflow"**.
3.  You can either:
    *   **Upload YAML/JSON:** Copy the content of `neuro-synapse-orkes-workflow.yaml` and paste it into the editor, or upload the file.
    *   **Use the UI:** Manually recreate the workflow structure using the Orkes visual workflow builder (more time-consuming for complex workflows).
4.  Ensure the workflow name is `neuro_synapse_workflow_v1` (or matches what's in your code).
5.  Save the workflow definition.

## Step 6: Test the Integration

1.  Ensure your NeuroVichar application is running (`npm run dev`).
2.  Ensure ngrok is running and forwarding to your NeuroVichar port, and `NGROK_BASE_URL` in `.env` is correct.
3.  Navigate to the Neuro Synapse page in your NeuroVichar application.
4.  Enter a prompt and submit.
5.  **Monitor:**
    *   **NeuroVichar Backend Console:** Check for logs from `neuro-synapse-flow.ts` indicating workflow start and polling.
    *   **Agent API Route Consoles:** Check for logs from your `/api/agents/*` routes as Orkes calls them.
    *   **Orkes Cloud Console:** Navigate to **Executions > Workflow Executions**. You should see your `neuro_synapse_workflow_v1` running. You can inspect its progress, input/output of each task, and any errors.

## Troubleshooting

*   **404 Errors in Orkes for HTTP Tasks:**
    *   Verify `NGROK_BASE_URL` is correct in your `.env` file and that your NeuroVichar app has picked up this value (restart if necessary).
    *   Ensure ngrok is running and correctly forwarding to your local application port (e.g., 9002).
    *   Check the URI in the Orkes task definition and workflow YAML matches the ngrok URL + API path (e.g., `https://xxxx.ngrok-free.app/api/agents/analyzer`).
*   **Orkes Authentication Errors:**
    *   Double-check `ORKES_KEY_ID` and `ORKES_KEY_SECRET` in your `.env` file.
    *   Ensure the API keys have the necessary permissions in Orkes Cloud for workflow execution.
    *   If using the mock client, these errors won't occur, but real API calls will fail.
*   **Workflow Stuck/Failed in Orkes:**
    *   Inspect the workflow execution in the Orkes Cloud console for detailed error messages on specific tasks.
    *   Check the console output of your local agent API routes for any errors during their execution.
*   **Input/Output Mismatch:**
    *   Carefully check the `inputParameters` in your workflow YAML and ensure they match what your agent API endpoints expect.
    *   Verify that the output of one task correctly maps to the input of the next (e.g., `${analyze_prompt_ref.output.response.body}`). JSONPath expressions in Orkes can be tricky. Use the Orkes UI to test task inputs/outputs.

## Next Steps & Production Considerations

*   **Official Orkes SDK:** Replace the mock `OrkesConductorClient` with the official Node.js SDK (`@orkesio/orkes-conductor-client`) for robust features, proper error handling, and authentication.
*   **Webhooks:** Instead of polling for workflow completion, configure Orkes to send a webhook to your application when the workflow finishes. This is more efficient.
*   **Error Handling:** Implement more comprehensive error handling in both your agent microservices and the `neuro-synapse-flow.ts`.
*   **Security:** Secure your ngrok tunnel or deploy your agent microservices to a publicly accessible, secure environment if not using ngrok for production.
*   **Task Domains:** For scaling, consider using task domains in Orkes to route tasks to specific worker groups.
*   **Dynamic Task Wiring:** The current `synthesize_final_result` task has hardcoded references to forked task outputs. For more dynamic plans from the `PlannerAgent`, you'd need a more sophisticated way to pass results to the synthesizer, potentially by having the planner define the input mapping for the synthesizer or by having the synthesizer dynamically inspect the output of the JOIN task.

This setup provides a powerful way to manage and scale your AI agent interactions within NeuroVichar.