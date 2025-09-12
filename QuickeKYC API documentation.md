QuickeKYC API

Introduction
The API is built using RESTful endpoints and standard HTTP verbs.

Response codes are used to indicate the status of the message and any error codes.
JSON is returned on all our API responses, including errors, with a consistent structure for all messages.
Authentication to the API is performed via token-based auth.
Requests to our API should be made as JSON, except when uploading documents.
All API requests must be made over HTTPS. Calls made over plain HTTP will fail.
All requests must use TLS 1.2 or above, with Server Name Indication enabled
Text fields support UTF-8, but do not allow certain special characters that could be used maliciously.
Getting Started
QuickeKYC's API exposes the entire QuickeKYC infrastructure via a standardized programmatic interface. Using QuickeKYC's API, you can avail all of our services, while using your programming language of choice. The QuickeKYC API is a RESTful API based on HTTP requests and JSON responses.

This version of the API, version 1. All requests work on HTTPS.

The easiest way to start using the QuickeKYC API is by clicking the Run in Postman button above. Postman is a free tool which helps developers run and debug API requests, and is the source of truth for this documentation. Every endpoint you see documented here is readily available by running our Postman collection.

Need help?
The QuickeKYC engineers are always around answering questions. The quickest way to get help is by contacting us at support@quickekyc.com

Endpoints
The API is accessed by making HTTP requests to a specific version endpoint URL, in which GET or POST variables contain information about what you wish to access. Every endpoint is accessed via an SSL-enabled HTTPS.

Everything (methods, parameters, etc.) is fixed to a version number, and every call must contain one. Different Versions are available at different endpoint URLs. The latest version is Version 1.

The stable HTTP endpoint for the latest version is:

https://api.quickekyc.com/api/v1

Responses
Each response is wrapped in a data tag. This means if you have a response, it will always be within the data field. We also include a status code, success flag, type and message in the responseof each request.

View More
json
{
    "data": {
        "pan_number": "XXXXRJ2451X",
        "full_name": "MONA LISA",
        "category": "person"
    },
    "status_code": 200,
    "message": null,
    "status": "success",
    "request_id": 100000

}
Errors and Status Codes
Standard HTTP error codes are returned in the case of a failure. 2xx codes indicate a successful message; 4xx codes indicate an error caused by information provided by the client; and 5xx codes indicate an error on QuickeKYC’s servers.

Status Codes
Status Codes	Name	Meaning
200	OK	Successful Request.
201	Created	Resource successfully created.
204	No Content	Successful with no Response.
Error Codes
Error Code	Name	Meaning
400	Bad Request	Malformed request
401	Unauthorized	Invalid authorization credentials
403	Forbidden	Action prohibited
404	Not Found	Resource not found
422	Unprocessable Entity	Validation error
429	Too Many Requests	Rate limit reached
500	Internal Server Error	An unexpected error occurred in our API
Rate Limits
QuickeKYC’s API enforces a maximum volume of requests per minute for all clients. Unless contractually agreed otherwise, the maximum rate is 100 requests per minute.

Any request over the limit will return a 429 HTTP response.

Avoiding the limit
The tips below are some simple suggestions to help reduce the possibility of being rate limited. We recommend:

running non essential or routine batch API jobs outside your peak hours.
throttling batch jobs.
implementing an exponential back-off approach for requests essential to your verification process, with an initial delay of 30 seconds.
prioritising requests that are essential to verify an active user.
setting up monitors and alerts for error responses on our API.
Backwards Compatibility
The following changes are considered backwards compatible:

Adding new API endpoints.
Adding new properties to the responses from existing API endpoints.
Adding optional request parameters to existing API endpoints.
Altering the format or length of IDs.
Altering the message attributes returned by validation failures or other errors.
Sending webhooks for new event types.
Reordering properties returned from existing API endpoints.



POST
Generate OTP v2
https://api.quickekyc.com/api/v1/aadhaar-v2/generate-otp
Endpoint to generate OTP from given Aadhaar Number.

View More
Plain Text
Wait 45 seconds to generate OTP for same Aadhaar Number.
Status Code 429 is sent in case request is sent in less than the prescribed time.
Request Body

Key	Format	Description
id_number	String	ID Number of the ID to run check on.
Response Body

Key	Format	Description
client_id	String	An unexpected error occurred in our API
otp_sent	Boolean	Whether OTP Sent
if_number	Boolean	If Number exists
HEADERS
Content-Type
application/json

Body
raw
{
    "key": "123-1234-12345-123456846",
    "id_number": "YourAadhaarNo"
}
Example Request
Generate OTP v2 - Success
View More
curl
curl --location 'https://api.quickekyc.com/api/v1/aadhaar-v2/generate-otp' \
--header 'Content-Type: application/json' \
--data '{
    "key": "123-1234-12345-123456846",
    "id_number": "YourAadhaarNo"
}'
200 OK
Example Response
Body
Headers (6)
json
{
  "data": {
    "otp_sent": true,
    "if_number": true,
    "valid_aadhaar": true
  },
  "status_code": 200,
  "message": "OTP Sent.",
  "status": "success",
  "request_id": 58
}
POST
Submit OTP v2
https://api.quickekyc.com/api/v1/aadhaar-v2/submit-otp
Endpoint to submit OTP after successful Generate OTP Request.

Request Parameters

Key	Format	Description
client_id	String	ID Number of the ID to run check on.
Response Body

Refer to Aadhaar v2 Object Model above.

HEADERS
Content-Type
application/json

Body
raw
{
    "key": "123-1234-12345-123456846",
    "request_id": "request_id",
    "otp": "OTP"
}