import clickUp from "./ClickUp.js";

const ErrorHandler = async (controller, error, req) => {
    const errorName = controller;
    const filename = controller;
    let err = error;
    const lineNumber =
      error.lineNumber ||
      (error.stack &&
        error.stack.split("\n")[1] &&
        error.stack.split("\n")[1].trim().split(":")[1]) ||
      "UnknownLine";
    const url = req.route.path;
    const user=req.user[0][0].rowid
    let errorMessage;
    if(controller=='Login Controller'){
       errorMessage = `
          Error occurred in file ${controller},
          line ${lineNumber},
          userId:0
          URL: '${url}'. 
          Error message: ${err}
          email:${req.body.email}
          `;
    }
    else if(controller=='registerUser Controller'){
       errorMessage = `
          Error occurred in file ${controller},
          line ${lineNumber},
          userId:0
          URL: '${url}'. 
          Error message: ${err}
          email:${req.body.data.email}
          username:${req.body.data.fullname}
          `;
    }
    else{
       errorMessage = `
      Error occurred in file ${controller},
      line ${lineNumber},
      userId:${user},
      URL: '${url}'. 
      Error message: ${err}`;
    }
    let res = await clickUp(errorName, errorMessage, filename, url);
  };

  export default ErrorHandler