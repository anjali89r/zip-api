export function success(body) {
  return buildResponse(200, body);
}

export function failure(body) {
  return buildResponse(500, body);
}
export function invalidrequest(body) {
  return buildResponse(400, body);
}
export function creation(body) {
  return buildResponse(201, body);
}
function buildResponse(statusCode, body) {
  let respfinal = {
    statusCode: statusCode,

    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": process.env.cors_hostname,
    },
    body: JSON.stringify(body),
  };
  // console.log(respfinal);
  return respfinal;
}
