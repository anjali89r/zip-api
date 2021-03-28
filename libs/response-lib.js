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
  // let description;
  console.log(statusCode);
  // switch (statusCode) {
  //   case 200:
  //     description = "200 OK";
  //     break;
  //   case 201:
  //     description = "201 Created";
  //     break;
  //   case 400:
  //     description = "400 Bad Request";
  //     break;
  //   case 500:
  //     description = "500 Internal Server Error";
  //     break;

  // }
  let respfinal = {
    statusCode: statusCode,
    headers: {
      "Set-cookie": "cookies",
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
  console.log(respfinal);
  return respfinal;
}
