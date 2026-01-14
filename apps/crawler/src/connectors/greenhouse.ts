import axios from "axios";

export async function fetchGreenhouseJobs(board: string) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${board}/jobs?content=true`;
  const resp = await axios.get(url, { timeout: 20000 });
  return resp.data.jobs as any[];
}
