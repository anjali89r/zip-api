import fetch from "node-fetch";
let options = {};
export async function apicall(action, url, request, headers) {
  options.headers = headers;
  let json;
  let response;
  try {
    switch (action.toUpperCase()) {
      case "GET":
        options.method = "get";
        options.body = null;
        try {
          // console.log(options);
          response = await fetch(url, options);
          json = await response.json();
        } catch (error) {
          console.error("Exception in api ", error);
          return {
            status: "Exception in calling get api",
          };
        }
        break;
      case "POST":
        options.method = "post";
        options.body = request;
        try {
          response = await fetch(url, options);
          json = await response.json();
        } catch (error) {
          console.error("Exception in api ", response);
          return {
            status: "Exception in calling post api",
          };
        }
        break;
      case "DELETE":
        options.method = "delete";
        options.body = request;
        try {
          response = await fetch(url, options);
          json = await response.json();
        } catch (error) {
          console.error("Exception in api ", response.statusText);
          return {
            status: "Exception in calling delete api",
          };
        }
        break;
      case "PUT":
        options.method = "put";
        options.body = request;
        try {
          response = await fetch(url, options);
          json = await response.json();
        } catch (error) {
          console.error("Exception in api ", response.statusText);
          return {
            status: "Exception in calling put api",
          };
        }
        break;
    }
    return json;
  } catch (ex) {
    console.error("API Lib call is failing with error ", ex);
    return {
      status: "Exception in calling api",
    };
  }
}
