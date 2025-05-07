
// src/scripts/register-orkes-defs.ts
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { OrkesConductorClient, type OrkesConductorClientConfig, type TaskDef, type WorkflowDef } from '@conductorcam/conductor-javascript';

// Ensure environment variables are loaded (especially for script execution)
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // Adjust path if script is run from different location

async function registerDefinitions() {
  const serverUrl = process.env.ORKES_SERVER_URL;
  const keyId = process.env.ORKES_KEY_ID;
  const keySecret = process.env.ORKES_KEY_SECRET;

  if (process.env.USE_MOCK_ORKES_CLIENT === 'true') {
    console.log("USE_MOCK_ORKES_CLIENT is true. Skipping actual registration with Orkes Cloud.");
    console.log("This script is intended for REAL Orkes registration. Exiting.");
    process.exit(0);
  }

  if (!serverUrl || !keyId || !keySecret) {
    console.error("ORKES_SERVER_URL, ORKES_KEY_ID, or ORKES_KEY_SECRET environment variables are not set.");
    console.error("Cannot register definitions with Orkes Cloud.");
    process.exit(1);
  }
  
  const clientConfig: OrkesConductorClientConfig = {
    serverUrl: serverUrl,
    keyId: keyId,
    keySecret: keySecret,
  };

  const client = new OrkesConductorClient(clientConfig);
  console.log("Orkes client initialized for registration.");

  try {
    // Load workflow definition from YAML
    const workflowFilePath = path.resolve(__dirname, '../workflows/neuro_synapse_workflow_v1.yaml');
    const workflowFileContent = fs.readFileSync(workflowFilePath, 'utf8');
    const workflowDef = yaml.load(workflowFileContent) as WorkflowDef;

    if (!workflowDef || !workflowDef.name) {
        throw new Error("Workflow definition is invalid or missing a name.");
    }

    console.log(`Registering/Updating workflow: ${workflowDef.name}`);
    // Use updateWorkflowDefs for idempotency (create or update)
    await client.metadataResource.updateWorkflowDefs([workflowDef]);
    console.log(`Workflow ${workflowDef.name} registered/updated successfully.`);

    // Register task definitions if they are defined in the YAML (under taskDefinitions key)
    // For HTTP tasks used directly in the workflow, their definition is embedded.
    // For tasks used in FORK_JOIN_DYNAMIC, they MUST be registered.
    
    const taskDefsToRegister: TaskDef[] = (workflowDef as any).taskDefinitions || [];

    if (taskDefsToRegister.length > 0) {
      console.log(`Registering/Updating ${taskDefsToRegister.length} task definitions...`);
      // Enrich task definitions with ownerEmail if not present, as it's often required.
      const enrichedTaskDefs = taskDefsToRegister.map(td => ({
        ownerEmail: "dev@neurovichar.ai", // Default owner
        ...td,
        // Ensure HTTP config is removed if present here, as it's for workflow task, not task def
        // The http_request block under taskDefinitions in YAML is for Orkes UI informational purposes
        // and is not used by the client library for task registration itself.
        // Actual HTTP details are used when the task is called within the workflow.
      }));
      // Use registerTaskDefs, which is idempotent (creates or updates).
      await client.metadataResource.registerTaskDefs(enrichedTaskDefs);
      console.log("Task definitions registered/updated successfully:", enrichedTaskDefs.map(td => td.name));
    } else {
      console.log("No separate task definitions found in YAML to register (HTTP tasks in main flow are self-defined).");
    }

    console.log("All definitions processed.");

  } catch (error: any) {
    console.error("Error during Orkes definition registration:", error);
    if (error.response && error.response.data) {
      console.error("Orkes API Response Error Body:", error.response.data);
    } else if (error.body) { // some errors might have the body directly
      console.error("Orkes API Error Body:", error.body);
    }
    process.exit(1);
  }
}

registerDefinitions();

