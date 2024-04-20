import axios from "axios";

async function clickUp(errorName, errorDescription, filename, url) {
  const query = new URLSearchParams({
    custom_task_ids: "true",
    team_id: "123",
  }).toString();

  const listId = process.env.CLICKUP_LIST_ID;
  const assigneesString = process.env.CLICKUP_ASSIGNEE;
  const assignees = JSON.parse(assigneesString);

  try {
    const response = await axios.post(
      `https://api.clickup.com/api/v2/list/${listId}/task?${query}`,
      {
        name: `error in ${filename}`,
        description: `url:${url},Error:${errorDescription}`,
        markdown_description: errorDescription,
        assignees: assignees,
        watchers: assignees,
        notify_all: true,
        parent: null,
        links_to: null,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.CLICKUP_AUTHORIZATION,
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

export default clickUp;
