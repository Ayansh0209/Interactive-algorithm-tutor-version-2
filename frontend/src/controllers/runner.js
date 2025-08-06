import { runCode as callPythonAPI } from '../api/python';

export async function executeAndPrepareTrace(code) {
  const trace = await callPythonAPI(code);
  const filtered = trace.filter(step => step.code?.trim());
  return filtered;
}
