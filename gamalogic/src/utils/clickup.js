
async function clickUpAttachment(file,clickUpResponse) {
    const query = new URLSearchParams({
        custom_task_ids: 'true',
        team_id: import.meta.env.VITE_CLICKUP_TEAM_ID
      }).toString();
      
      const form = new FormData();
      form.append("attachment", file);
      const taskId = clickUpResponse;
      const Authorization=import.meta.env.VITE_CLICKUP_AUTHORISATION
      const resp = await fetch(
        `https://api.clickup.com/api/v2/task/${taskId}/attachment?${query}`,
        {
          method: 'POST',
          headers: {
            Authorization:Authorization
          },
          body: form
        }
      );
      
      const data = await resp.text();
}

export default clickUpAttachment;
