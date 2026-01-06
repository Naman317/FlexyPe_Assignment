//API Response 
class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

//  successful response
const sendSuccess = (res, statusCode = 200, data = null, message = 'Success') => {
  return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
};

// Send error response
const sendError = (res, statusCode = 500, message = 'Internal Server Error', data = null) => {
  return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
};

module.exports = {
  ApiResponse,
  sendSuccess,
  sendError,
};
