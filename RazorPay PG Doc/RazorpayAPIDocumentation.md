Razorpay APIs Documentation
Razorpay is an Indian payments solution provider that allows businesses to accept, process and disburse payments with its product suite. Razorpay APIs are completely RESTful and all our responses are returned in JSON.

API Authentication
All Razorpay APIs are authenticated using Basic Auth. Basic auth requires the following:

[YOUR_KEY_ID]
[YOUR_KEY_SECRET]
Basic auth expects an Authorization header for each request in the Basic base64token format. Here, base64token is a base64 encoded string of YOUR_KEY_ID:YOUR_KEY_SECRET.

Watch Out! 
The Authorization header value should strictly adhere to the format mentioned above. Invalid formats will result in authentication failures. Few examples of invalid headers are:



BASIC base64token
basic base64token
Basic "base64token"
Basic $base64token
﻿
Generate API Key
You can use Razorpay APIs in two modes, Test and Live. The API key is different for each mode.

To generate the API keys:

Log into the Razorpay Dashboard.
Select the mode (Test or Live) for which you want to generate the API key.

- Test Mode: The test mode is a simulation mode that you can use to test your integration flow. Your customers will not be able to make payments in this mode.

- Live Mode: When your integration is complete, in the Dashboard, switch to the live mode and generate live mode API keys. Replace test mode keys with live mode keys in the integration to accept payments from customers.
Navigate to Settings → API Keys → Generate Key to generate key for the selected mode.
Errors
All successful responses are returned with HTTP Status code 204. In case of failure, API returns a JSON error response with the parameters that contain the failure reason.

Understanding Error Response
The error response contains code, description, field, source, step, and reason parameters to understand and troubleshoot the error.

Let us take an example where a merchant tries to add new allowed payer accounts when the overall limit is exceeded.

Plain Text
{
  "error": {
    "code": "BAD_REQUEST_ERROR",
    "description": "Authentication failed due to incorrect otp",
    "field": null,
    "source": "customer",
    "step": "payment_authentication",
    "reason": "invalid_otp",
    "metadata": {
      "payment_id": "pay_EDNBKIP31Y4jl8",
      "order_id": "order_DBJKIP31Y4jl8"
    }
  }
}
Response Parameters
error
: object The error object.

code
: string Type of the error.

description
: string Description of the error.

field
: string Name of the parameter in the API request that caused the error.

source
: string The point of failure in the specific operation (payment in this case). For example, customer, business

step
: string The stage where the transaction failure occurred. The stages can vary depending on the payment method used to complete the transaction.

reason
: string The exact error reason. It can be handled programmatically.

metadata
: object Contains additional information about the request.

Plain Text
`payment_id`
: `string` Unique identifier of the payment.
﻿
`order_id`
: `string` Unique identifier of the order associated with the payment.
Know more about Error Codes.

Authorization
Basic Auth
Username
{{api_key}}
Password
{{api_secret}}
Customers APIs
Add or create Customers with basic details such as name, email and contact details. You can then offer various Razorpay solutions to your customers. Edit customer details as needed.

List of APIs:
﻿Create a Customer﻿
﻿Edit Customer Details﻿
﻿Fetch All Customers﻿
﻿Fetch Customer With ID﻿
Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
POST
Create a Customer
https://api.razorpay.com/v1/customers
You can use this API to create or add a customer with basic details such as name and contact details.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
json
{
  "name":"Gauri Kumari",
  "email":"gauri.kumari@example.com",
  "contact":"9123456780",
  "fail_existing":"1",
  "gstin":"12ABCDE2356F7GH",
  "notes":{
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  }
}
Example
Create a Customer
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/customers' \
--header 'Content-Type: application/json' \
--data-raw '{
  "name":"Gauri Kumari",
  "email":"gauri.kumari@example.com",
  "contact":"9123456780",
  "fail_existing":"1",
  "gstin":"12ABCDE2356F7GH",
  "notes":{
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  }
}'
200 OK
Response
Body
Headers (8)
View More
Text
{
    "id": "cust_R78uV41l2R6p7f",
    "entity": "customer",
    "name": "Gauri Kumari",
    "email": "gauri.kumari@example.com",
    "contact": "9123456780",
    "gstin": "12ABCDE2356F7GH",
    "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
    },
    "shipping_address": [],
    "created_at": 1755595499
}
GET
Fetch All Customers
https://api.razorpay.com/v1/customers?count=1
You can use this API to retrieve the details of all the customers.

Authorization
Basic Auth
Username
<username>
Password
<password>
Query Params
count
1
Example
Fetch All Customers
Request
cURL
curl --location 'https://api.razorpay.com/v1/customers?count=1'
200 OK
Response
Body
Headers (8)
View More
Text
{
    "entity": "collection",
    "count": 1,
    "items": [
        {
            "id": "cust_R78uV41l2R6p7f",
            "entity": "customer",
            "name": "Gauri Kumari",
            "email": "gauri.kumari@example.com",
            "contact": "9123456780",
            "gstin": "12ABCDE2356F7GH",
            "notes": {
                "notes_key_1": "Tea, Earl Grey, Hot",
                "notes_key_2": "Tea, Earl Grey… decaf."
            },
            "shipping_address": [],
            "created_at": 1755595499
        }
    ]
}
GET
Fetch Customer With ID
https://api.razorpay.com/v1/customers/cust_R78uV41l2R6p7f
You can use this API to retrieve details of a customer with id.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch Customer With ID
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/customers/cust_R78uV41l2R6p7f'
200 OK
Response
Body
Headers (8)
View More
Text
{
    "id": "cust_R78uV41l2R6p7f",
    "entity": "customer",
    "name": "Gauri Kumari",
    "email": "gauri.kumari@example.com",
    "contact": "9123456780",
    "gstin": "12ABCDE2356F7GH",
    "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
    },
    "shipping_address": [],
    "created_at": 1755595499
}
PUT
Edit Customer Details
https://api.razorpay.com/v1/customers/cust_R78uV41l2R6p7f
You can use this API  to edit the customer details such as name, email and contact details. When editing a customer's details, ensure that the combination of the values in the email and contact attributes is unique for every customer.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
json
{
  "name": "Gauri Kumar",
  "email": "gauri.kumar@example.com",
  "contact": "9123456780"
}
Example
Edit Customer Details
Request
View More
cURL
curl --location --request PUT 'https://api.razorpay.com/v1/customers/cust_R78uV41l2R6p7f' \
--header 'Content-Type: application/json' \
--data-raw '{
  "name": "Gauri Kumar",
  "email": "gauri.kumar@example.com",
  "contact": "9123456780"
}'
200 OK
Response
Body
Headers (8)
View More
Text
{
    "id": "cust_R78uV41l2R6p7f",
    "entity": "customer",
    "name": "Gauri Kumar",
    "email": "gauri.kumar@example.com",
    "contact": "9123456780",
    "gstin": "12ABCDE2356F7GH",
    "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
    },
    "shipping_address": [],
    "created_at": 1755595499
}
Orders APIs
You can create and link them to payments. Orders APIs are used to create, update and retrieve details of Orders. Also, you can retrieve details of payments made towards these Orders.

List of APIs:
﻿Create an Order﻿
﻿Fetch All Orders﻿
﻿Fetch an Order With ID﻿
﻿Fetch Payments for an Order﻿
﻿Update an Order﻿
Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
POST
Create an Order
https://api.razorpay.com/v1/orders
You can use this API to create an order with basic details such as amount and currency.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
json
{
  "amount": 10000,
  "currency": "INR",
  "receipt": "Receipt no. 1",
  "notes": {
    "notes_key_1": "Tea, Earl Grey, Hot",
    "notes_key_2": "Tea, Earl Grey… decaf."
  }
}
Example
Create an Order
Request
cURL
curl --location 'https://api.razorpay.com/v1/orders' \
--header 'Content-Type: application/json' \
--data '{
  "amount": 10000,
  "currency": "INR",
  "receipt": "Receipt no. 1",
  "notes": {
    "notes_key_1": "Tea, Earl Grey, Hot",
    "notes_key_2": "Tea, Earl Grey… decaf."
  }
}'
200 OK
Response
Body
Headers (11)
View More
Text
{
    "amount": 10000,
    "amount_due": 10000,
    "amount_paid": 0,
    "attempts": 0,
    "created_at": 1755598355,
    "currency": "INR",
    "entity": "order",
    "id": "order_R79imLhexM52Pi",
    "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
    },
    "offer_id": null,
    "receipt": "Receipt no. 1",
    "status": "created"
}
GET
Fetch All Orders
https://api.razorpay.com/v1/orders?count=1
You can use this API to retrieve the details of all the orders you created. In this example, count and skip query parameters have been used. You can invoke this API without these query parameters as well.

Authorization
Basic Auth
Username
<username>
Password
<password>
Query Params
count
1
Example
Fetch All Orders
Request
cURL
curl --location 'https://api.razorpay.com/v1/orders?count=1' \
--header 'Content-Type: application/json' \
--data ''
200 OK
Response
Body
Headers (12)
View More
Text
{
    "entity": "collection",
    "count": 1,
    "items": [
        {
            "id": "order_R79imLhexM52Pi",
            "entity": "order",
            "amount": 10000,
            "amount_paid": null,
            "amount_due": 10000,
            "currency": "INR",
            "receipt": "Receipt no. 1",
            "offer_id": null,
            "status": "created",
            "attempts": 0,
            "notes": {
                "notes_key_1": "Tea, Earl Grey, Hot",
                "notes_key_2": "Tea, Earl Grey… decaf."
            },
            "created_at": 1755598355
        }
    ]
}
GET
Fetch All Orders (With Expanded Payments)
https://api.razorpay.com/v1/orders?expand[]=payments&count=1
You can use this API to retrieve the details of all the orders that you created, with the payment parameter expanded.

Authorization
Basic Auth
Username
<username>
Password
<password>
Query Params
expand[]
payments
count
1
Example
Fetch All Orders (With Expanded Payments)
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/orders?expand[]=payments&count=1' \
--header 'Content-Type: application/json' \
--data ''
200 OK
Response
Body
Headers (12)
View More
Text
{
    "entity": "collection",
    "count": 1,
    "items": [
        {
            "id": "order_R7AgWm3KispZjJ",
            "entity": "order",
            "amount": 10000,
            "amount_paid": 10000,
            "amount_due": 0,
            "currency": "INR",
            "receipt": "Receipt no. 1",
            "payments": {
                "entity": "collection",
                "count": 1,
                "items": [
                    {
                        "id": "pay_R7AjczHWEzV2wW",
                        "entity": "payment",
                        "amount": 10000,
                        "currency": "INR",
                        "status": "captured",
                        "order_id": "order_R7AgWm3KispZjJ",
                        "invoice_id": null,
                        "international": false,
                        "method": "card",
                        "amount_refunded": 0,
                        "refund_status": null,
                        "captured": true,
                        "description": null,
                        "card_id": "card_R7AjdCJAoZzg3M",
                        "card": {
                            "id": "card_R7AjdCJAoZzg3M",
                            "entity": "card",
                            "name": "",
                            "last4": "8228",
                            "network": "MasterCard",
                            "type": "credit",
                            "issuer": "HDFC",
                            "international": false,
                            "emi": true,
                            "sub_type": "business",
                            "token_iin": null
                        },
                        "bank": null,
                        "wallet": null,
                        "vpa": null,
                        "email": "gaurav.kumar@example.com",
                        "contact": "+919900008989",
                        "notes": {
                            "notes_key_1": "Tea, Earl Grey, Hot",
                            "notes_key_2": "Tea, Earl Grey… decaf."
                        },
                        "fee": 309,
                        "tax": 0,
                        "error_code": null,
                        "error_description": null,
                        "error_source": null,
                        "error_step": null,
                        "error_reason": null,
                        "acquirer_data": {
                            "auth_code": "248519"
                        },
                        "created_at": 1755601926
                    }
                ]
            },
            "offer_id": null,
            "status": "paid",
            "attempts": 1,
            "notes": {
                "notes_key_1": "Tea, Earl Grey, Hot",
                "notes_key_2": "Tea, Earl Grey… decaf."
            },
            "created_at": 1755601749
        }
    ]
}
GET
Fetch All Orders (With Expanded Card Payments)
https://api.razorpay.com/v1/orders?expand[]=payments.card&count=1
You can use this API to retrieve the details of all the orders that you created, with the card parameter expanded in the payments object.

Authorization
Basic Auth
Username
<username>
Password
<password>
Query Params
expand[]
payments.card
count
1
Example
Fetch All Orders (With Expanded Card Payments)
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/orders?expand[]=payments.card&count=1' \
--header 'Content-Type: application/json' \
--data ''
200 OK
Response
Body
Headers (12)
View More
Text
{
    "entity": "collection",
    "count": 1,
    "items": [
        {
            "id": "order_R7AgWm3KispZjJ",
            "entity": "order",
            "amount": 10000,
            "amount_paid": 10000,
            "amount_due": 0,
            "currency": "INR",
            "receipt": "Receipt no. 1",
            "payments": {
                "entity": "collection",
                "count": 1,
                "items": [
                    {
                        "id": "pay_R7AjczHWEzV2wW",
                        "entity": "payment",
                        "amount": 10000,
                        "currency": "INR",
                        "status": "captured",
                        "order_id": "order_R7AgWm3KispZjJ",
                        "invoice_id": null,
                        "international": false,
                        "method": "card",
                        "amount_refunded": 0,
                        "refund_status": null,
                        "captured": true,
                        "description": null,
                        "card_id": "card_R7AjdCJAoZzg3M",
                        "card": {
                            "id": "card_R7AjdCJAoZzg3M",
                            "entity": "card",
                            "name": "",
                            "last4": "8228",
                            "network": "MasterCard",
                            "type": "credit",
                            "issuer": "HDFC",
                            "international": false,
                            "emi": true,
                            "sub_type": "business",
                            "token_iin": null
                        },
                        "bank": null,
                        "wallet": null,
                        "vpa": null,
                        "email": "gaurav.kumar@example.com",
                        "contact": "+919900008989",
                        "notes": {
                            "notes_key_1": "Tea, Earl Grey, Hot",
                            "notes_key_2": "Tea, Earl Grey… decaf."
                        },
                        "fee": 309,
                        "tax": 0,
                        "error_code": null,
                        "error_description": null,
                        "error_source": null,
                        "error_step": null,
                        "error_reason": null,
                        "acquirer_data": {
                            "auth_code": "248519"
                        },
                        "created_at": 1755601926
                    }
                ]
            },
            "offer_id": null,
            "status": "paid",
            "attempts": 1,
            "notes": {
                "notes_key_1": "Tea, Earl Grey, Hot",
                "notes_key_2": "Tea, Earl Grey… decaf."
            },
            "created_at": 1755601749
        }
    ]
}
GET
Fetch an Order With ID
https://api.razorpay.com/v1/orders/{order_id}
You can use this API to retrieve details of a particular order as per the id.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch an Order With ID
Request
cURL
curl --location --globoff 'https://api.razorpay.com/v1/orders/{order_id}'
200 OK
Response
Body
Headers (13)
View More
Text
{
    "id": "order_R7AgWm3KispZjJ",
    "entity": "order",
    "amount": 10000,
    "amount_paid": 10000,
    "amount_due": 0,
    "currency": "INR",
    "receipt": "Receipt no. 1",
    "offer_id": null,
    "status": "paid",
    "attempts": 1,
    "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
    },
    "created_at": 1755601749,
    "description": null,
    "checkout": null
}
GET
Fetch Payments for an Order
https://api.razorpay.com/v1/orders/{order_id}/payments
You can use this API to fetch all the payments made for an order. The response contains all the authorised or failed payments for that order.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch Payments for an Order
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/orders/{order_id}/payments'
200 OK
Response
Body
Headers (13)
View More
Text
{
    "entity": "collection",
    "count": 1,
    "items": [
        {
            "id": "pay_R7AjczHWEzV2wW",
            "entity": "payment",
            "amount": 10000,
            "currency": "INR",
            "status": "captured",
            "order_id": "order_R7AgWm3KispZjJ",
            "invoice_id": null,
            "international": false,
            "method": "card",
            "amount_refunded": 0,
            "refund_status": null,
            "captured": true,
            "description": null,
            "card_id": "card_R7AjdCJAoZzg3M",
            "card": {
                "id": "card_R7AjdCJAoZzg3M",
                "entity": "card",
                "name": "",
                "last4": "8228",
                "network": "MasterCard",
                "type": "credit",
                "issuer": "HDFC",
                "international": false,
                "emi": true,
                "sub_type": "business",
                "token_iin": null
            },
            "bank": null,
            "wallet": null,
            "vpa": null,
            "email": "gaurav.kumar@example.com",
            "contact": "+919900008989",
            "notes": {
                "notes_key_1": "Tea, Earl Grey, Hot",
                "notes_key_2": "Tea, Earl Grey… decaf."
            },
            "fee": 309,
            "tax": 0,
            "error_code": null,
            "error_description": null,
            "error_source": null,
            "error_step": null,
            "error_reason": null,
            "acquirer_data": {
                "auth_code": "248519"
            },
            "created_at": 1755601926
        }
    ]
}
GET
Update an Order
https://api.razorpay.com/v1/orders/{order_id}
You can use this API to update an Order.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
json
{
  "notes": {
    "notes_key_1": "Beam me up Scotty",
    "notes_key_2": "Engage"
  }
}
Example
Update an Order
Request
View More
cURL
curl --location --globoff --request GET 'https://api.razorpay.com/v1/orders/{order_id}' \
--header 'Content-Type: application/json' \
--data '{
  "notes": {
    "notes_key_1": "Beam me up Scotty",
    "notes_key_2": "Engage"
  }
}'
200 OK
Response
Body
Headers (12)
View More
Text
{
    "id": "order_R7AgWm3KispZjJ",
    "entity": "order",
    "amount": 10000,
    "amount_paid": 10000,
    "amount_due": 0,
    "currency": "INR",
    "receipt": "Receipt no. 1",
    "offer_id": null,
    "status": "paid",
    "attempts": 1,
    "notes": {
        "notes_key_1": "Beam me up Scotty",
        "notes_key_2": "Engage"
    },
    "created_at": 1755601749,
    "description": null,
    "checkout": null
}
Payments APIs
You can create payments using the Razorpay Standard Checkout. https://razorpay.com/docs/payment-gateway/.

Payments APIs are used to capture and fetch payments. You can also fetch payments based on orders and card details of payment.

List of APIs
﻿Capture a Payment﻿
﻿Fetch a Payment With ID﻿
﻿Fetch a Payment (With Expanded Card Details)﻿
﻿Fetch a Payment (With Expanded EMI Details)﻿
﻿Fetch a Payment (With Expanded Offers Details)﻿
﻿Fetch a Payment (With Expanded UPI Details)﻿
﻿Fetch All Payments﻿
﻿Fetch All Payment (With Expanded Card Details)﻿
﻿Fetch All Payment (With Expanded EMI Details)﻿
﻿Fetch Payments Based on Orders﻿
﻿Fetch Card Details of a Payment﻿
﻿Update a Payment﻿
Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
Payment Downtime API
Downtime is when one or more payment options underperform, leading to considerable delays in payment processing. These downtimes are due to technical issues or outages at Razorpay's partner or issuing banks.

List of APIs:

﻿Fetch All Payment Downtime Details﻿
﻿Fetch Payment Downtime Details With ID﻿
Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
GET
Fetch All Payment Downtime Details
https://api.razorpay.com/v1/payments/downtimes
You can use this API to retrieve details of all payment downtimes.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch All Payment Downtime Details
Request
cURL
curl --location 'https://api.razorpay.com/v1/payments/downtimes'
200 OK
Response
Body
Headers (13)
View More
{
    "entity": "collection",
    "count": 7,
    "items": [
        {
            "id": "down_Ql8NrxCZohraK8",
            "entity": "payment.downtime",
            "method": "emandate",
            "begin": 1750790163,
            "end": null,
            "status": "started",
            "scheduled": false,
            "severity": "high",
            "instrument": {
                "bank": "PYTM"
            },
            "created_at": 1750790163,
            "updated_at": 1750790163
        },
        {
            "id": "down_Qwxqzpk5l7F6KY",
            "entity": "payment.downtime",
            "method": "upi",
            "begin": 1753373161,
            "end": null,
            "status": "started",
            "scheduled": false,
            "severity": "high",
            "instrument": {
                "vpa_handle": "abc"
            },
            "created_at": 1753373161,
            "updated_at": 1753373161
        },
        {
            "id": "down_R53mZkE5mGK4pM",
            "entity": "payment.downtime",
            "method": "netbanking",
            "begin": 1755140761,
            "end": null,
            "status": "started",
            "scheduled": false,
            "severity": "high",
            "instrument": {
                "bank": "UTIB"
            },
            "created_at": 1755140761,
            "updated_at": 1755140761
        },
        {
            "id": "down_R7IIdkyeUVgbmW",
            "entity": "payment.downtime",
            "method": "emandate",
            "begin": 1755628565,
            "end": null,
            "status": "started",
            "scheduled": false,
            "severity": "high",
            "instrument": {
                "bank": "KKBK"
            },
            "created_at": 1755628565,
            "updated_at": 1755628565
        },
        {
            "id": "down_R7RuN88QBSlkVX",
            "entity": "payment.downtime",
            "method": "netbanking",
            "begin": 1755662403,
            "end": null,
            "status": "started",
            "scheduled": false,
            "severity": "high",
            "instrument": {
                "bank": "ICIC"
            },
            "created_at": 1755662403,
            "updated_at": 1755662403
        },
        {
            "id": "down_R7Umdeu4dAh0DT",
            "entity": "payment.downtime",
            "method": "emandate",
            "begin": 1755672528,
            "end": null,
            "status": "started",
            "scheduled": false,
            "severity": "high",
            "instrument": {
                "bank": "UTIB"
            },
            "created_at": 1755672528,
            "updated_at": 1755672528
        },
        {
            "id": "down_R7UmskD4z5Dybx",
            "entity": "payment.downtime",
            "method": "emandate",
            "begin": 1755672542,
            "end": null,
            "status": "started",
            "scheduled": false,
            "severity": "high",
            "instrument": {
                "bank": "HDFC"
            },
            "created_at": 1755672542,
            "updated_at": 1755672542
        }
    ]
}
GET
Fetch Payment Downtime Details With ID
https://api.razorpay.com/v1/payments/downtimes/{down_id}
You can use this API to fetch downtime status if you have not received any webhook notifications due to technical issues.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch Payment Downtime Details With ID
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/payments/downtimes/{down_id}'
200 OK
Response
Body
Headers (12)
View More
{
    "id": "down_Ql8NrxCZohraK8",
    "entity": "payment.downtime",
    "method": "emandate",
    "begin": 1750790163,
    "end": null,
    "status": "started",
    "scheduled": false,
    "severity": "high",
    "instrument": {
        "bank": "PYTM"
    },
    "created_at": 1750790163,
    "updated_at": 1750790163
}
POST
Capture a Payment
https://api.razorpay.com/v1/payments/{pay_id}/capture
You can use this API to change the payment status from authorized to captured.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
json
{
  "amount": 100,
  "currency": "INR"
}
Example
Capture a Payment
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/payments/{pay_id}/capture' \
--data '{
  "amount": 100,
  "currency": "INR"
}'
200 OK
Response
Body
Headers (13)
View More
Text
{
    "id": "pay_R06qI0K2bV0Ww8",
    "entity": "payment",
    "amount": 100,
    "currency": "INR",
    "status": "captured",
    "order_id": null,
    "invoice_id": null,
    "international": false,
    "method": "netbanking",
    "amount_refunded": 0,
    "refund_status": null,
    "captured": true,
    "description": "Payment for your product",
    "card_id": null,
    "bank": "BARB_R",
    "wallet": null,
    "vpa": null,
    "email": "gaurav.kumar@example.com",
    "contact": "+917702092342",
    "notes": [],
    "fee": 3,
    "tax": 0,
    "error_code": null,
    "error_description": null,
    "error_source": null,
    "error_step": null,
    "error_reason": null,
    "acquirer_data": {
        "bank_transaction_id": "9197357"
    },
    "created_at": 1754059837,
    "reward": null
}
GET
Fetch a Payment With ID
https://api.razorpay.com/v1/payments/{pay_id}
You can use this API to retrieve the details of a specific payment using its id.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch a Payment With ID
Request
cURL
curl --location --globoff 'https://api.razorpay.com/v1/payments/{pay_id}'
200 OK
Response
Body
Headers (13)
View More
Text
{
    "id": "pay_R7AjczHWEzV2wW",
    "entity": "payment",
    "amount": 10000,
    "currency": "INR",
    "status": "captured",
    "order_id": "order_R7AgWm3KispZjJ",
    "invoice_id": null,
    "international": false,
    "method": "card",
    "amount_refunded": 0,
    "refund_status": null,
    "captured": true,
    "description": null,
    "card_id": "card_R7AjdCJAoZzg3M",
    "card": {
        "id": "card_R7AjdCJAoZzg3M",
        "entity": "card",
        "name": "",
        "last4": "8228",
        "network": "MasterCard",
        "type": "credit",
        "issuer": "HDFC",
        "international": false,
        "emi": true,
        "sub_type": "business",
        "token_iin": null
    },
    "bank": null,
    "wallet": null,
    "vpa": null,
    "email": "gaurav.kumar@example.com",
    "contact": "+919900008989",
    "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
    },
    "fee": 309,
    "tax": 0,
    "error_code": null,
    "error_description": null,
    "error_source": null,
    "error_step": null,
    "error_reason": null,
    "acquirer_data": {
        "auth_code": "248519"
    },
    "created_at": 1755601926
}
GET
Fetch a Payment (With Expanded Card Details)
https://api.razorpay.com/v1/payments/:id/?expand[]=card
You can use this API to retrieve the details of all the payments that you created, with the card parameter expanded in the payments object.

Authorization
Basic Auth
Username
<username>
Password
<password>
Query Params
expand[]
card
Path Variables
id
Example
Fetch a Payment (With Expanded Card Details)
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/payments/:id/?expand[]=card'
200 OK
Response
Body
Headers (13)
View More
Text
{
    "id": "pay_R7AjczHWEzV2wW",
    "entity": "payment",
    "amount": 10000,
    "currency": "INR",
    "status": "captured",
    "order_id": "order_R7AgWm3KispZjJ",
    "invoice_id": null,
    "international": false,
    "method": "card",
    "amount_refunded": 0,
    "refund_status": null,
    "captured": true,
    "description": null,
    "card_id": "card_R7AjdCJAoZzg3M",
    "card": {
        "id": "card_R7AjdCJAoZzg3M",
        "entity": "card",
        "name": "",
        "last4": "8228",
        "network": "MasterCard",
        "type": "credit",
        "issuer": "HDFC",
        "international": false,
        "emi": true,
        "sub_type": "business",
        "token_iin": null
    },
    "bank": null,
    "wallet": null,
    "vpa": null,
    "email": "gaurav.kumar@example.com",
    "contact": "+919900008989",
    "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
    },
    "fee": 309,
    "tax": 0,
    "error_code": null,
    "error_description": null,
    "error_source": null,
    "error_step": null,
    "error_reason": null,
    "acquirer_data": {
        "auth_code": "248519"
    },
    "created_at": 1755601926
}
GET
Fetch a Payment (With Expanded EMI Details)
https://api.razorpay.com/v1/payments/:id/?expand[]=emi
You can use this API to retrieve the details of all the payments that you created, with the emi parameter expanded in the payments object.

Authorization
Basic Auth
Username
<username>
Password
<password>
Query Params
expand[]
emi
Path Variables
id
Example
Fetch a Payment (With Expanded EMI Details)
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/payments/:id/?expand[]=emi'
200 OK
Response
Body
Headers (13)
View More
Text
{
    "id": "pay_R7CXF6R2J0yi5P",
    "entity": "payment",
    "amount": 10000,
    "currency": "INR",
    "status": "created",
    "order_id": "order_R7CX0PTLCHPPLu",
    "invoice_id": null,
    "international": false,
    "method": "emi",
    "amount_refunded": 0,
    "refund_status": null,
    "captured": false,
    "description": null,
    "card_id": "card_R7CXFGhZM05T9x",
    "bank": "HDFC",
    "wallet": null,
    "vpa": null,
    "email": "gaurav.kumar@example.com",
    "contact": "+919000090000",
    "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
    },
    "fee": null,
    "tax": null,
    "error_code": null,
    "error_description": null,
    "error_source": null,
    "error_step": null,
    "error_reason": null,
    "acquirer_data": {
        "auth_code": null
    },
    "emi": {
        "issuer": "HDFC",
        "type": "credit",
        "rate": 1600,
        "duration": 9
    },
    "created_at": 1755608266
}
GET
Fetch a Payment (With Expanded Offers Details)
https://api.razorpay.com/v1/payments/:id/?expand[]=offers
You can use this API to retrieve the details of all the payments that you created, with the offer parameter expanded in the payments object.

Authorization
Basic Auth
Username
<username>
Password
<password>
Query Params
expand[]
offers
Path Variables
id
GET
Fetch a Payment (With Expanded UPI Details)
https://api.razorpay.com/v1/payments/:id/?expand[]=upi
You can use this API to retrieve the details of all the payments that you created, with the upi parameter expanded in the payments object.

Authorization
Basic Auth
Username
<username>
Password
<password>
Query Params
expand[]
upi
Path Variables
id
Example
Fetch a Payment (With Expanded UPI Details)
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/payments/:id/?expand[]=upi'
200 OK
Response
Body
Headers (13)
View More
{
    "id": "pay_R1Z8NIvUHpSC6R",
    "entity": "payment",
    "amount": 1000,
    "currency": "INR",
    "status": "captured",
    "order_id": "order_R1Z89c3EYs7Q47",
    "invoice_id": null,
    "international": false,
    "method": "upi",
    "amount_refunded": 0,
    "refund_status": null,
    "captured": true,
    "description": "Payment for your product",
    "card_id": null,
    "bank": null,
    "wallet": null,
    "vpa": "success@razorpay",
    "email": "gaurav.kumar@example.com",
    "contact": "+919000090000",
    "notes": [],
    "fee": 25,
    "tax": 4,
    "error_code": null,
    "error_description": null,
    "error_source": null,
    "error_step": null,
    "error_reason": null,
    "acquirer_data": {
        "rrn": "971335186460",
        "upi_transaction_id": "4EAFBB4567CE5AA77839833EBADA522F"
    },
    "created_at": 1754377809,
    "upi": {
        "vpa": "success@razorpay"
    }
}
GET
Fetch All Payments
https://api.razorpay.com/v1/payments/
You can use this API to retrieve details of all the payments.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch All Payments
Request
cURL
curl --location 'https://api.razorpay.com/v1/payments/' \
--data ''
200 OK
Response
Body
Headers (13)
View More
Text
{
    "entity": "collection",
    "count": 2,
    "items": [
        {
            "id": "pay_R7CXF6R2J0yi5P",
            "entity": "payment",
            "amount": 10000,
            "currency": "INR",
            "status": "captured",
            "order_id": "order_R7CX0PTLCHPPLu",
            "invoice_id": null,
            "international": false,
            "method": "emi",
            "amount_refunded": 0,
            "refund_status": null,
            "captured": true,
            "description": null,
            "card_id": "card_R7CXFGhZM05T9x",
            "bank": "HDFC",
            "wallet": null,
            "vpa": null,
            "email": "gaurav.kumar@example.com",
            "contact": "+919000090000",
            "notes": {
                "notes_key_1": "Tea, Earl Grey, Hot",
                "notes_key_2": "Tea, Earl Grey… decaf."
            },
            "fee": 309,
            "tax": 0,
            "error_code": null,
            "error_description": null,
            "error_source": null,
            "error_step": null,
            "error_reason": null,
            "acquirer_data": {
                "auth_code": "735983"
            },
            "created_at": 1755608266
        },
        {
            "id": "pay_R7CHLA5TpiO8Jp",
            "entity": "payment",
            "amount": 10000,
            "currency": "INR",
            "status": "captured",
            "order_id": "order_R7CBdGCtdLKRf6",
            "invoice_id": null,
            "international": false,
            "method": "card",
            "amount_refunded": 0,
            "refund_status": null,
            "captured": true,
            "description": null,
            "card_id": "card_R7CHLO5gBulV3k",
            "card": {
                "id": "card_R7CHLO5gBulV3k",
                "entity": "card",
                "name": "",
                "last4": "8228",
                "network": "MasterCard",
                "type": "credit",
                "issuer": "HDFC",
                "international": false,
                "emi": true,
                "sub_type": "business",
                "token_iin": null
            },
            "bank": null,
            "wallet": null,
            "vpa": null,
            "email": "gaurav.kumar@example.com",
            "contact": "+919900008989",
            "notes": {
                "notes_key_1": "Tea, Earl Grey, Hot",
                "notes_key_2": "Tea, Earl Grey… decaf."
            },
            "fee": 309,
            "tax": 0,
            "error_code": null,
            "error_description": null,
            "error_source": null,
            "error_step": null,
            "error_reason": null,
            "acquirer_data": {
                "auth_code": "243934"
            },
            "created_at": 1755607362
        }
    ]
}
GET
Fetch All Payments (With Expanded Card Details)
https://api.razorpay.com/v1/payments/?expand[]=card&count=1
You can use this API to retrieve the expanded card details of the payments, where the payment method is card.

Authorization
Basic Auth
Username
<username>
Password
<password>
Query Params
expand[]
card
count
1
Example
Fetch All Payments (With Expanded Card Details)
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/payments/?expand[]=card&count=1'
200 OK
Response
Body
Headers (13)
View More
{
    "entity": "collection",
    "count": 1,
    "items": [
        {
            "id": "pay_R7xUF79X2Sbwli",
            "entity": "payment",
            "amount": 5000,
            "currency": "INR",
            "status": "captured",
            "order_id": "order_R7xTMobjQOwPYz",
            "invoice_id": "inv_R7xTLYjC1b6gO0",
            "international": false,
            "method": "card",
            "amount_refunded": 100,
            "refund_status": "partial",
            "captured": true,
            "description": "#R7xTLYjC1b6gO0",
            "card_id": "card_R7xUFOUabRpnWQ",
            "card": {
                "id": "card_R7xUFOUabRpnWQ",
                "entity": "card",
                "name": "",
                "last4": "8228",
                "network": "MasterCard",
                "type": "credit",
                "issuer": "HDFC",
                "international": false,
                "emi": true,
                "sub_type": "business",
                "token_iin": null
            },
            "bank": null,
            "wallet": null,
            "vpa": null,
            "email": "gaurav.kumar@example.com",
            "contact": "+919000090000",
            "notes": [],
            "fee": 155,
            "tax": 0,
            "error_code": null,
            "error_description": null,
            "error_source": null,
            "error_step": null,
            "error_reason": null,
            "acquirer_data": {
                "auth_code": "170751"
            },
            "created_at": 1755773611
        }
    ]
}
GET
Fetch All Payments (With Expanded EMI Details)
https://api.razorpay.com/v1/payments/:id/?expand[]=emi
You can use this API to retrieve the expanded EMI plan details of the payments, in which the payment method is emi.

Authorization
Basic Auth
Username
<username>
Password
<password>
Query Params
expand[]
emi
Path Variables
id
Example
Fetch All Payments (With Expanded EMI Details)
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/payments/:id/?expand[]=emi'
200 OK
Response
Body
Headers (13)
View More
{
    "id": "pay_R7CXF6R2J0yi5P",
    "entity": "payment",
    "amount": 10000,
    "currency": "INR",
    "status": "captured",
    "order_id": "order_R7CX0PTLCHPPLu",
    "invoice_id": null,
    "international": false,
    "method": "emi",
    "amount_refunded": 0,
    "refund_status": null,
    "captured": true,
    "description": null,
    "card_id": "card_R7CXFGhZM05T9x",
    "bank": "HDFC",
    "wallet": null,
    "vpa": null,
    "email": "gaurav.kumar@example.com",
    "contact": "+919000090000",
    "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
    },
    "fee": 309,
    "tax": 0,
    "error_code": null,
    "error_description": null,
    "error_source": null,
    "error_step": null,
    "error_reason": null,
    "acquirer_data": {
        "auth_code": "735983"
    },
    "created_at": 1755608266
}
GET
Fetch Payment based on Order
https://api.razorpay.com/v1/orders/{order_id}/payments
You can use this API to retrieve payments corresponding to an order.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch Payment based on Order
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/orders/{order_id}/payments'
200 OK
Response
Body
Headers (13)
View More
Text
{
    "entity": "collection",
    "count": 1,
    "items": [
        {
            "id": "pay_R7AjczHWEzV2wW",
            "entity": "payment",
            "amount": 10000,
            "currency": "INR",
            "status": "captured",
            "order_id": "order_R7AgWm3KispZjJ",
            "invoice_id": null,
            "international": false,
            "method": "card",
            "amount_refunded": 0,
            "refund_status": null,
            "captured": true,
            "description": null,
            "card_id": "card_R7AjdCJAoZzg3M",
            "card": {
                "id": "card_R7AjdCJAoZzg3M",
                "entity": "card",
                "name": "",
                "last4": "8228",
                "network": "MasterCard",
                "type": "credit",
                "issuer": "HDFC",
                "international": false,
                "emi": true,
                "sub_type": "business",
                "token_iin": null
            },
            "bank": null,
            "wallet": null,
            "vpa": null,
            "email": "gaurav.kumar@example.com",
            "contact": "+919900008989",
            "notes": {
                "notes_key_1": "Tea, Earl Grey, Hot",
                "notes_key_2": "Tea, Earl Grey… decaf."
            },
            "fee": 309,
            "tax": 0,
            "error_code": null,
            "error_description": null,
            "error_source": null,
            "error_step": null,
            "error_reason": null,
            "acquirer_data": {
                "auth_code": "248519"
            },
            "created_at": 1755601926
        }
    ]
}
GET
Fetch Card Details of a Payment
https://api.razorpay.com/v1/payments/{pay_id}/card
You can use this API to retrieve the details of the card used to make a payment.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch Card Details of a Payment
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/payments/{pay_id}/card'
200 OK
Response
Body
Headers (12)
View More
Text
{
    "id": "card_R7AjdCJAoZzg3M",
    "entity": "card",
    "name": "",
    "last4": "8228",
    "network": "MasterCard",
    "type": "credit",
    "issuer": "HDFC",
    "international": false,
    "emi": true,
    "sub_type": "business",
    "token_iin": null
}
PATCH
Update a Payment
https://api.razorpay.com/v1/payments/{pay_id}
You can use this API to modify the notes field for a particular payment.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Update a Payment
Request
View More
cURL
curl --location --globoff --request PATCH 'https://api.razorpay.com/v1/payments/{pay_id}' \
--data ''
200 OK
Response
Body
Headers (12)
View More
Text
{
    "id": "pay_R7AjczHWEzV2wW",
    "entity": "payment",
    "amount": 10000,
    "currency": "INR",
    "status": "captured",
    "order_id": "order_R7AgWm3KispZjJ",
    "invoice_id": null,
    "international": false,
    "method": "card",
    "amount_refunded": 0,
    "refund_status": null,
    "captured": true,
    "description": null,
    "card_id": "card_R7AjdCJAoZzg3M",
    "card": {
        "id": "card_R7AjdCJAoZzg3M",
        "entity": "card",
        "name": "",
        "last4": "8228",
        "network": "MasterCard",
        "type": "credit",
        "issuer": "HDFC",
        "international": false,
        "emi": true,
        "sub_type": "business",
        "token_iin": null
    },
    "bank": null,
    "wallet": null,
    "vpa": null,
    "email": "gaurav.kumar@example.com",
    "contact": "+919900008989",
    "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
    },
    "fee": 309,
    "tax": 0,
    "error_code": null,
    "error_description": null,
    "error_source": null,
    "error_step": null,
    "error_reason": null,
    "acquirer_data": {
        "auth_code": "248519"
    },
    "created_at": 1755601926
}
Refunds APIs
You can make full or partial refunds to customers. While issuing refunds, you can choose to process the refunds instantly or at normal speed (within 5-7 working days). Razorpay provides you real-time tracking of the processing speed and the status of the initiated refund.

Refunds Can be Made Only on Captured Payments
You can initiate refunds only on those payments that are in captured state. A payment in authorized state is auto-refunded if not captured within 5 days of creation.

List of APIs
﻿Create a Normal Refund﻿
﻿Create an Instant Refund﻿
﻿Fetch Multiple Refunds for a Payment﻿
﻿Fetch a Specific Refund for a Payment﻿
﻿Fetch All Refunds﻿
﻿Fetch Refund With ID﻿
﻿Update Refund﻿
Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
POST
Create a Normal Refund
https://api.razorpay.com/v1/payments/{pay_id}/refund
You can use this API to create a normal refund for a payment.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
json
{
  "amount": 10000
}
Example
Create a Normal Refund
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/payments/{pay_id}/refund' \
--data '{
  "amount": 10000
}'
200 OK
Response
Body
Headers (7)
View More
Text
{
    "acquirer_data": {
        "arn": null
    },
    "amount": 10000,
    "base_amount": 10000,
    "batch_id": null,
    "created_at": 1755622126,
    "currency": "INR",
    "entity": "refund",
    "id": "rfnd_R7GTH3oiaXMUQE",
    "notes": [],
    "payment_id": "pay_R7AjczHWEzV2wW",
    "receipt": null,
    "speed_processed": "instant",
    "speed_requested": "optimum",
    "status": "pending"
}
POST
Create an Instant Refund
https://api.razorpay.com/v1/payments/{pay_id}/refund
You can use this API to process refunds instantaneously to your customers.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
json
{
  "amount": 10000,
  "receipt": "Receipt No. 2",
  "notes": {
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  }
}
Example
Create an Instant Refund
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/payments/{pay_id}/refund' \
--data '{
  "amount": 10000,
  "receipt": "Receipt No. 2",
  "notes": {
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  }
}'
200 OK
Response
Body
Headers (7)
View More
Text
{
    "acquirer_data": {
        "arn": null
    },
    "amount": 10000,
    "base_amount": 10000,
    "batch_id": null,
    "created_at": 1755622619,
    "currency": "INR",
    "entity": "refund",
    "id": "rfnd_R7Gbxms0cUGslA",
    "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
    },
    "payment_id": "pay_R7CHLA5TpiO8Jp",
    "receipt": "Receipt No. 2",
    "speed_processed": "instant",
    "speed_requested": "optimum",
    "status": "pending"
}
GET
Fetch All Refunds
https://api.razorpay.com/v1/refunds?count=2
You can use this API to retrieve details of all refunds.

Authorization
Basic Auth
Username
<username>
Password
<password>
Query Params
count
2
Example
Fetch All Refunds
Request
cURL
curl --location 'https://api.razorpay.com/v1/refunds?count=2'
200 OK
Response
Body
Headers (7)
View More
Text
{
    "count": 2,
    "entity": "collection",
    "items": [
        {
            "acquirer_data": {
                "arn": null
            },
            "amount": 10000,
            "batch_id": null,
            "created_at": 1755622619,
            "currency": "INR",
            "entity": "refund",
            "id": "rfnd_R7Gbxms0cUGslA",
            "notes": {
                "notes_key_1": "Tea, Earl Grey, Hot",
                "notes_key_2": "Tea, Earl Grey… decaf."
            },
            "payment_id": "pay_R7CHLA5TpiO8Jp",
            "receipt": "Receipt No. 2",
            "speed_processed": "normal",
            "speed_requested": "optimum",
            "status": "processed"
        },
        {
            "acquirer_data": {
                "arn": null
            },
            "amount": 10000,
            "batch_id": null,
            "created_at": 1755622126,
            "currency": "INR",
            "entity": "refund",
            "id": "rfnd_R7GTH3oiaXMUQE",
            "notes": [],
            "payment_id": "pay_R7AjczHWEzV2wW",
            "receipt": null,
            "speed_processed": "normal",
            "speed_requested": "optimum",
            "status": "processed"
        }
    ]
}
GET
Fetch Refund With ID
https://api.razorpay.com/v1/refunds/{rfnd_id}
You can use this API to retrieve the refund using the id.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch Refund With ID
Request
cURL
curl --location --globoff 'https://api.razorpay.com/v1/refunds/{rfnd_id}'
200 OK
Response
Body
Headers (7)
View More
Text
{
    "acquirer_data": {
        "arn": null
    },
    "amount": 10000,
    "batch_id": null,
    "created_at": 1755622126,
    "currency": "INR",
    "entity": "refund",
    "id": "rfnd_R7GTH3oiaXMUQE",
    "notes": [],
    "payment_id": "pay_R7AjczHWEzV2wW",
    "receipt": null,
    "speed_processed": "normal",
    "speed_requested": "optimum",
    "status": "processed"
}
GET
Fetch a Specific Refund for a Payment
https://api.razorpay.com/v1/payments/{pay_id}/refunds/{rfnd_id}
You can use this API to retrieve details of a specific refund made for a payment.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch a Specific Refund for a Payment
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/payments/{pay_id}/refunds/{rfnd_id}' \
--data ''
200 OK
Response
Body
Headers (7)
View More
Text
{
    "acquirer_data": {
        "arn": null
    },
    "amount": 10000,
    "batch_id": null,
    "created_at": 1755622126,
    "currency": "INR",
    "entity": "refund",
    "id": "rfnd_R7GTH3oiaXMUQE",
    "notes": [],
    "payment_id": "pay_R7AjczHWEzV2wW",
    "receipt": null,
    "speed_processed": "normal",
    "speed_requested": "optimum",
    "status": "processed"
}
GET
Fetch Multiple Refunds for a Payment
https://api.razorpay.com/v1/payments/{pay_id}/refunds
You can use this API to retrieve multiple refunds for a payment.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch Multiple Refunds for a Payment
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/payments/{pay_id}/refunds' \
--data ''
200 OK
Response
Body
Headers (7)
View More
Text
{
    "count": 1,
    "entity": "collection",
    "items": [
        {
            "acquirer_data": {
                "arn": null
            },
            "amount": 10000,
            "batch_id": null,
            "created_at": 1755622126,
            "currency": "INR",
            "entity": "refund",
            "id": "rfnd_R7GTH3oiaXMUQE",
            "notes": [],
            "payment_id": "pay_R7AjczHWEzV2wW",
            "receipt": null,
            "speed_processed": "normal",
            "speed_requested": "optimum",
            "status": "processed"
        }
    ]
}
PATCH
Update a Refund
https://api.razorpay.com/v1/refunds/{rfnd_id}
You can use this API to update the notes parameter for a refund.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
json
{
  "notes": {
    "notes_key_1":"Beam me up Scotty.",
    "notes_key_2":"Engage"
  }
}
Example
Update a Refund
Request
View More
cURL
curl --location --globoff --request PATCH 'https://api.razorpay.com/v1/refunds/{rfnd_id}' \
--data '{
  "notes": {
    "notes_key_1":"Beam me up Scotty.",
    "notes_key_2":"Engage"
  }
}'
200 OK
Response
Body
Headers (12)
View More
Text
{
    "acquirer_data": {
        "arn": null
    },
    "amount": 10000,
    "batch_id": null,
    "created_at": 1755622126,
    "currency": "INR",
    "entity": "refund",
    "id": "rfnd_R7GTH3oiaXMUQE",
    "notes": {
        "notes_key_1": "Beam me up Scotty.",
        "notes_key_2": "Engage"
    },
    "payment_id": "pay_R7AjczHWEzV2wW",
    "receipt": null,
    "speed_processed": "normal",
    "speed_requested": "optimum",
    "status": "processed"
}
Settlements APIs
Razorpay Settlements is the process in which the money received from your customers is settled to your bank account. You can manage settlements using APIs or from the Dashboard.
Captured payments are automatically settled to the bank account submitted to us as part of your KYC verification as per your settlement cycle.

List of APIs
﻿Fetch All Settlements﻿
﻿Fetch Settlement With ID﻿
﻿Settlement Recon﻿
Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
Instant Settlements
This section has information on APIs used as part of Razorpay Capital. With Instant Settlements, you get access to your funds as and when you want. You can manage Instant Settlements using APIs or from the Dashboard.

List of APIs:

﻿Create an Instant Settlement﻿
﻿Fetch All Instant Settlements﻿
﻿Fetch Instant Settlement With ID﻿
﻿Fetch All Instant Settlements With Payout Details﻿
﻿Fetch Instant Settlement With ID And Payout Details﻿
Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
POST
Create an Instant Settlement
https://api.razorpay.com/v1/settlements/ondemand
You can use this API to create an Instant Settlement.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
json
{
  "amount": 5000,
  "description": "Make vendor payouts",
  "notes": {
    "notes_key_1": "Tea, Earl Grey, Hot",
    "notes_key_2": "Tea, Earl Grey… decaf."
  }
}
Example
Create an Instant Settlement
Request
cURL
curl --location 'https://api.razorpay.com/v1/settlements/ondemand' \
--header 'Content-Type: application/json' \
--data '{
  "amount": 5000,
  "description": "Make vendor payouts",
  "notes": {
    "notes_key_1": "Tea, Earl Grey, Hot",
    "notes_key_2": "Tea, Earl Grey… decaf."
  }
}'
200 OK
Response
Body
Headers (12)
View More
Text
{
    "id": "setlod_R7Hf2KrI9SNxnS",
    "entity": "settlement.ondemand",
    "amount_requested": 5000,
    "amount_settled": 0,
    "amount_pending": 4990,
    "amount_reversed": 0,
    "fees": 10,
    "tax": 2,
    "currency": "INR",
    "settle_full_balance": false,
    "status": "initiated",
    "description": "Make vendor payouts",
    "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
    },
    "created_at": 1755626316,
    "scheduled": false
}
GET
Fetch All Instant Settlements
https://api.razorpay.com/v1/settlements/ondemand
You can use this API to retrieve the details of all Instant Settlements.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch All Instant Settlements
Request
cURL
curl --location 'https://api.razorpay.com/v1/settlements/ondemand' \
--data ''
200 OK
Response
Body
Headers (12)
View More
Text
{
    "entity": "collection",
    "count": 2,
    "items": [
        {
            "id": "setlod_R7Hf2KrI9SNxnS",
            "entity": "settlement.ondemand",
            "amount_requested": 5000,
            "amount_settled": 4990,
            "amount_pending": 0,
            "amount_reversed": 0,
            "fees": 10,
            "tax": 2,
            "currency": "INR",
            "settle_full_balance": false,
            "status": "processed",
            "description": "Make vendor payouts",
            "notes": {
                "notes_key_1": "Tea, Earl Grey, Hot",
                "notes_key_2": "Tea, Earl Grey… decaf."
            },
            "created_at": 1755626316,
            "scheduled": false
        },
        {
            "id": "setlod_KlrU7xty6Yj6qL",
            "entity": "settlement.ondemand",
            "amount_requested": 13600,
            "amount_settled": 13551,
            "amount_pending": 0,
            "amount_reversed": 0,
            "fees": 49,
            "tax": 8,
            "currency": "INR",
            "settle_full_balance": false,
            "status": "processed",
            "description": null,
            "notes": [],
            "created_at": 1669726472,
            "scheduled": false
        }
    ]
}
GET
Fetch Instant Settlement With ID
https://api.razorpay.com/v1/settlements/ondemand/{setlod_id}
You can use this API to retrieve the details of a particular Instant Settlement.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch Instant Settlement With ID
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/settlements/ondemand/{setlod_id}'
200 OK
Response
Body
Headers (12)
View More
{
    "id": "setlod_R7Hf2KrI9SNxnS",
    "entity": "settlement.ondemand",
    "amount_requested": 5000,
    "amount_settled": 4990,
    "amount_pending": 0,
    "amount_reversed": 0,
    "fees": 10,
    "tax": 2,
    "currency": "INR",
    "settle_full_balance": false,
    "status": "processed",
    "description": "Make vendor payouts",
    "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
    },
    "created_at": 1755626316,
    "scheduled": false
}
GET
Fetch All Instant Settlements With Payout Details
https://api.razorpay.com/v1/settlements/ondemand?expand[]=ondemand_payouts
You can use this API to etrieve payout details as part of the response for all instant settlements.

Authorization
Basic Auth
Username
<username>
Password
<password>
Query Params
expand[]
ondemand_payouts
Example
Fetch All Instant Settlements With Payout Details
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/settlements/ondemand?expand[]=ondemand_payouts'
200 OK
Response
Body
Headers (12)
View More
{
    "entity": "collection",
    "count": 2,
    "items": [
        {
            "id": "setlod_R7Hf2KrI9SNxnS",
            "entity": "settlement.ondemand",
            "amount_requested": 5000,
            "amount_settled": 4990,
            "amount_pending": 0,
            "amount_reversed": 0,
            "fees": 10,
            "tax": 2,
            "currency": "INR",
            "settle_full_balance": false,
            "status": "processed",
            "description": "Make vendor payouts",
            "notes": {
                "notes_key_1": "Tea, Earl Grey, Hot",
                "notes_key_2": "Tea, Earl Grey… decaf."
            },
            "created_at": 1755626316,
            "scheduled": false,
            "ondemand_payouts": {
                "entity": "collection",
                "count": 1,
                "items": [
                    {
                        "id": "setlodp_R7Hf2RXJvRJmk8",
                        "entity": "settlement.ondemand_payout",
                        "initiated_at": 1755626327,
                        "processed_at": 1755626337,
                        "reversed_at": null,
                        "amount": 5000,
                        "amount_settled": 4990,
                        "fees": 10,
                        "tax": 2,
                        "utr": "3935637404",
                        "status": "processed",
                        "created_at": 1755626316
                    }
                ]
            }
        },
        {
            "id": "setlod_KlrU7xty6Yj6qL",
            "entity": "settlement.ondemand",
            "amount_requested": 13600,
            "amount_settled": 13551,
            "amount_pending": 0,
            "amount_reversed": 0,
            "fees": 49,
            "tax": 8,
            "currency": "INR",
            "settle_full_balance": false,
            "status": "processed",
            "description": null,
            "notes": [],
            "created_at": 1669726472,
            "scheduled": false,
            "ondemand_payouts": {
                "entity": "collection",
                "count": 1,
                "items": [
                    {
                        "id": "setlodp_KlrU7y6McibvGS",
                        "entity": "settlement.ondemand_payout",
                        "initiated_at": 1669726483,
                        "processed_at": 1669726493,
                        "reversed_at": null,
                        "amount": 13600,
                        "amount_settled": 13551,
                        "fees": 49,
                        "tax": 8,
                        "utr": "2447284236",
                        "status": "processed",
                        "created_at": 1669726472
                    }
                ]
            }
        }
    ]
}
GET
Fetch Instant Settlement With ID And Payout Details
https://api.razorpay.com/v1/settlements/ondemand/{setlod_id}?expand[]=ondemand_payouts
You can use this API to retrieve payout details as part of the response for a specific instant settlements.

Authorization
Basic Auth
Username
<username>
Password
<password>
Query Params
expand[]
ondemand_payouts
Example
Fetch Instant Settlement With ID And Payout Details
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/settlements/ondemand/{setlod_id}?expand[]=ondemand_payouts'
200 OK
Response
Body
Headers (12)
View More
{
    "id": "setlod_R7Hf2KrI9SNxnS",
    "entity": "settlement.ondemand",
    "amount_requested": 5000,
    "amount_settled": 4990,
    "amount_pending": 0,
    "amount_reversed": 0,
    "fees": 10,
    "tax": 2,
    "currency": "INR",
    "settle_full_balance": false,
    "status": "processed",
    "description": "Make vendor payouts",
    "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
    },
    "created_at": 1755626316,
    "scheduled": false,
    "ondemand_payouts": {
        "entity": "collection",
        "count": 1,
        "items": [
            {
                "id": "setlodp_R7Hf2RXJvRJmk8",
                "entity": "settlement.ondemand_payout",
                "initiated_at": 1755626327,
                "processed_at": 1755626337,
                "reversed_at": null,
                "amount": 5000,
                "amount_settled": 4990,
                "fees": 10,
                "tax": 2,
                "utr": "3935637404",
                "status": "processed",
                "created_at": 1755626316
            }
        ]
    }
}
GET
Fetch Settlement Recon Details
https://api.razorpay.com/v1/settlements/recon/combined?year=2019&month=09
You can use this API to return a list of all transactions such as payments, refunds, transfers and adjustments settled to your account on a particular day or month.

Authorization
Basic Auth
Username
<username>
Password
<password>
Query Params
year
2019
month
09
Example
Fetch Settlement Recon Details
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/settlements/recon/combined?year=2019&month=09'
200 OK
Response
Body
Headers (12)
View More
Text
{
    "entity": "collection",
    "count": 2,
    "items": [
        {
            "entity_id": "pay_R0SuHKAgQpmmYL",
            "type": "payment",
            "debit": 0,
            "credit": 1170,
            "amount": 1200,
            "currency": "INR",
            "fee": 30,
            "tax": 4,
            "on_hold": false,
            "settled": true,
            "created_at": 1754137542,
            "settled_at": 1754368235,
            "settlement_id": "setl_R1WPpfNgMynDAM",
            "posted_at": null,
            "credit_type": "default",
            "description": "Payment for your product",
            "notes": "{}",
            "payment_id": null,
            "settlement_utr": "d28oip695mdc710h9bp0",
            "order_id": "order_R0SraKA3yGeje0",
            "order_receipt": "",
            "method": "netbanking",
            "card_network": null,
            "card_issuer": null,
            "card_type": null,
            "dispute_id": null
        },
        {
            "entity_id": "pay_R01BSTZQcs2jSW",
            "type": "payment",
            "debit": 0,
            "credit": 97,
            "amount": 100,
            "currency": "INR",
            "fee": 3,
            "tax": 0,
            "on_hold": false,
            "settled": true,
            "created_at": 1754039910,
            "settled_at": 1754364663,
            "settlement_id": "setl_R1VOvxI0HWZxuP",
            "posted_at": null,
            "credit_type": "default",
            "description": "Payment for your product",
            "notes": "{}",
            "payment_id": null,
            "settlement_utr": "d28nmu6437ss715mar3g",
            "order_id": "order_R01A1ZdSW1iBxa",
            "order_receipt": "",
            "method": "upi",
            "card_network": null,
            "card_issuer": null,
            "card_type": null,
            "dispute_id": null
        }
    ]
}
GET
Fetch Settlements With ID
https://api.razorpay.com/v1/settlements/{setl_id}
You can use this API to retrieve details of a settlement with its id.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch Settlement With ID
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/settlements/{setl_id}'
200 OK
Response
Body
Headers (13)
Text
{
    "id": "setl_R2i1P9oxwIOMul",
    "entity": "settlement",
    "amount": 1170,
    "status": "processed",
    "fees": 0,
    "tax": 0,
    "utr": "d2anru1jjjac713cs0l0",
    "created_at": 1754627447
}
GET
Fetch All Settlements
https://api.razorpay.com/v1/settlements
You can use this API to retrieve details of all settlements.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch All Settlements
Request
cURL
curl --location 'https://api.razorpay.com/v1/settlements'
200 OK
Response
Body
Headers (12)
View More
Text
{
    "entity": "collection",
    "count": 2,
    "items": [
        {
            "id": "setl_R2i1P9oxwIOMul",
            "entity": "settlement",
            "amount": 1170,
            "status": "processed",
            "fees": 0,
            "tax": 0,
            "utr": "d2anru1jjjac713cs0l0",
            "created_at": 1754627448
        },
        {
            "id": "setl_R2JTUgMbMsitWT",
            "entity": "settlement",
            "amount": 6829,
            "status": "processed",
            "fees": 0,
            "tax": 0,
            "utr": "d2a2oiatcbas714jdd20",
            "created_at": 1754541003
        }
    ]
}
Disputes APIs
A dispute arises when your customer or the issuing bank questions the validity of a payment. You can manage disputes using APIs or from the Dashboard to ensure a seamless dispute management experience.

List of APIs
﻿Fetch All Disputes﻿
﻿Fetch a Dispute With ID﻿
﻿Accept a Dispute﻿
﻿Contest a Dispute﻿
﻿Fetch a Dispute With ID (With Expanded Payments Details)﻿
﻿Fetch a Dispute With ID (With Expanded transaction.settlement Details)﻿
Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
Documents
Use the Documents APIs to securely upload and share documents with Razorpay.

List of APIs
﻿Create a Document﻿
﻿Fetch Document Information﻿
﻿Fetch Document Content﻿
Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
POST
Create a Document
https://api.razorpay.com/v1/documents
You can use this API to upload a document onto the Razorpay ecosystem.

Authorization
Basic Auth
Username
<username>
Password
<password>
GET
Fetch Document Information
https://api.razorpay.com/v1/documents/:id
You can use this API to retrieve the details of any document that was uploaded earlier.

Authorization
Basic Auth
This request is using an authorization helper from collection Razorpay APIs
Path Variables
id
GET
Fetch Document Content
https://api.razorpay.com/v1/documents/:id/content
You can use this API to download an earlier uploaded document.

Authorization
Basic Auth
This request is using an authorization helper from collection Razorpay APIs
Path Variables
id
GET
Fetch All Disputes
https://api.razorpay.com/v1/disputes
You can use this API to retrieve all the disputes raised by your customers.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch All Disputes
Request
cURL
curl --location 'https://api.razorpay.com/v1/disputes'
200 OK
Response
Body
Headers (12)
View More
{
    "entity": "collection",
    "count": 1,
    "items": [
        {
            "id": "disp_Ov1EjAnqce6KX0",
            "entity": "dispute",
            "payment_id": "pay_Ov18KxLBqZD4F8",
            "amount": 1000,
            "currency": "INR",
            "base_currency": "INR",
            "amount_deducted": 1000,
            "gateway_dispute_id": "Ov18KxLBqZD4F8",
            "reason_code": "customer_is_still_claiming_that_services_are_not_delivered",
            "respond_by": 1726079400,
            "status": "lost",
            "phase": "chargeback",
            "comments": null,
            "created_at": 1725874222,
            "international": null
        }
    ]
}
GET
Fetch a Dispute With ID
https://api.razorpay.com/v1/disputes/{disp_id}
You can use this API to retrieve the details of a specific dispute.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch a Dispute With ID
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/disputes/{disp_id}'
200 OK
Response
Body
Headers (12)
View More
{
    "id": "disp_Ov1EjAnqce6KX0",
    "entity": "dispute",
    "payment_id": "pay_Ov18KxLBqZD4F8",
    "amount": 1000,
    "currency": "INR",
    "base_currency": "INR",
    "amount_deducted": 1000,
    "gateway_dispute_id": "Ov18KxLBqZD4F8",
    "reason_code": "customer_is_still_claiming_that_services_are_not_delivered",
    "respond_by": 1726079400,
    "status": "lost",
    "phase": "chargeback",
    "comments": null,
    "created_at": 1725874222,
    "international": null,
    "isBalanceSufficient": true
}
POST
Accept a Dispute
https://api.razorpay.com/v1/disputes/{disp_id}/accept
You can use this API to accept a dispute charge, indicating that you do not wish to contest the dispute, acknowledging it as lost.

Authorization
Basic Auth
Username
<username>
Password
<password>
PATCH
Contest a Dispute
https://api.razorpay.com/v1/disputes/:id/contest/
You can use this API to contest a dispute, indicating that you would like to challenge the dispute raised against a payment.

Authorization
Basic Auth
Username
<username>
Password
<password>
Path Variables
id
Body
raw (json)
View More
json
{
    "amount": 5000,
    "summary": "goods delivered",
    "shipping_proof": [
        "doc_EFtmUsbwpXwBH9",
        "doc_EFtmUsbwpXwBH8"
    ],
    "others": [
        {
            "type": "receipt_signed_by_customer",
            "document_ids": [
                "doc_EFtmUsbwpXwBH1",
                "doc_EFtmUsbwpXwBH7"
            ]
        }
    ],
    "action": "draft"
}
GET
Fetch a Dispute With ID (With Expanded Payments Details)
https://dashboard.dev.razorpay.in/app/disputes/:disp_id/?expand[]=payment
You can use this API to retrieve the details of a specific dispute using expanded payments details.

Authorization
Basic Auth
Username
<username>
Password
<password>
Query Params
expand[]
payment
Path Variables
disp_id
GET
Fetch a Dispute With ID (With Expanded transaction.settlement Details)
https://dashboard.dev.razorpay.in/app/disputes/{disp_id}?expand[]=transaction.settlement
You can use this API to retrieve the details of a specific dispute using expanded transaction.settlement details.

Authorization
Basic Auth
This request is using an authorization helper from collection Razorpay APIs
Query Params
expand[]
transaction.settlement
Invoices APIs
You can use Razorpay Invoices to send invoices to your customers and accept payments instantly.The invoice contains information regarding the sale such as the name of the invoiced products or services, quantity, billing cycle, price breakup, receipt number and customer information.

List of APIs
﻿Create an Invoice With Customer ID﻿
﻿Create an Invoice With Customer Details﻿
﻿Update an Invoice﻿
﻿Issue an Invoice﻿
﻿Delete an Invoice﻿
﻿Cancel an Invoice﻿
﻿Fetch an Invoice With ID﻿
﻿Fetch All Invoices﻿
﻿Send Notifications﻿
Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
POST
Create an Invoice with Customer Id
https://api.razorpay.com/v1/invoices
You can use this API to  create an invoice by passing the customer_id.

Authorization
Basic Auth
Username
<username>
Password
<password>
Query Params
count
10
skip
10
Body
raw (json)
json
{
  "type": "invoice",
  "date": 1760714528,
  "customer_id": "cust_R1bstJ8RVxwjpJ",
  "line_items": [
    {
      "item_id": "item_R7Tq1FYn5XGUUw"
    }
  ]
}
Example
Create an Invoice with Customer Id
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/invoices' \
--header 'Content-Type: application/json' \
--data '{
  "type": "invoice",
  "date": 1760714528,
  "customer_id": "cust_R1bstJ8RVxwjpJ",
  "line_items": [
    {
      "item_id": "item_R7Tq1FYn5XGUUw"
    }
  ]
}'
200 OK
Response
Body
Headers (12)
View More
{
    "id": "inv_R7TqLos4PAfMlk",
    "entity": "invoice",
    "receipt": null,
    "invoice_number": null,
    "customer_id": "cust_R1bstJ8RVxwjpJ",
    "customer_details": {
        "id": "cust_R1bstJ8RVxwjpJ",
        "name": "Gaurav Kumar",
        "email": "gaurav.kumar@example.com",
        "contact": "9123456780",
        "gstin": "12ABCDE2356F7GH",
        "billing_address": {
            "id": "addr_R7TZpeJJ0D4ACF",
            "type": "billing_address",
            "primary": true,
            "line1": "Koramangala",
            "line2": "Koramangala",
            "zipcode": "560076",
            "city": "Bengaluru",
            "state": "Karnataka",
            "country": "in",
            "contact": null,
            "name": null,
            "tag": null,
            "landmark": null
        },
        "shipping_address": null,
        "customer_name": "Gaurav Kumar",
        "customer_email": "gaurav.kumar@example.com",
        "customer_contact": "9123456780"
    },
    "order_id": "order_R7TqM2Q0UWd5qF",
    "line_items": [
        {
            "id": "li_R7TqLtRiisScww",
            "item_id": "item_R7Tq1FYn5XGUUw",
            "ref_id": null,
            "ref_type": null,
            "name": "Yellow Herb",
            "description": "Yellow herb from Resident Evil",
            "amount": 10000,
            "unit_amount": 10000,
            "gross_amount": 10000,
            "tax_amount": 0,
            "taxable_amount": 10000,
            "net_amount": 10000,
            "currency": "INR",
            "type": "invoice",
            "tax_inclusive": false,
            "hsn_code": null,
            "sac_code": null,
            "tax_rate": null,
            "unit": null,
            "quantity": 1,
            "taxes": []
        }
    ],
    "payment_id": null,
    "status": "issued",
    "expire_by": null,
    "issued_at": 1755669218,
    "paid_at": null,
    "cancelled_at": null,
    "expired_at": null,
    "sms_status": "pending",
    "email_status": "pending",
    "date": 1760714528,
    "terms": null,
    "partial_payment": false,
    "gross_amount": 10000,
    "tax_amount": 0,
    "taxable_amount": 10000,
    "amount": 10000,
    "amount_paid": 0,
    "amount_due": 10000,
    "currency": "INR",
    "currency_symbol": "₹",
    "description": null,
    "notes": [],
    "comment": null,
    "short_url": "https://rzp.io/rzp/JYSt3Ke",
    "view_less": true,
    "billing_start": null,
    "billing_end": null,
    "type": "invoice",
    "group_taxes_discounts": false,
    "created_at": 1755669218,
    "ref_num": null
}
POST
Create an Invoice with Customer Details
https://api.razorpay.com/v1/invoices
You can use this API to create an invoice using details such as name, billing_address and shipping_address.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
View More
json
{
  "type": "invoice",
  "description": "Invoice for the month of January 2020",
  "partial_payment": true,
  "customer": {
    "name": "Gaurav Kumar",
    "contact": 9000090000,
    "email": "gaurav.kumar@example.com",
    "billing_address": {
      "line1": "Ground & 1st Floor, SJR Cyber Laskar",
      "line2": "Hosur Road",
      "zipcode": "560068",
      "city": "Bengaluru",
      "state": "Karnataka",
      "country": "in"
    },
    "shipping_address": {
      "line1": "Ground & 1st Floor, SJR Cyber Laskar",
      "line2": "Hosur Road",
      "zipcode": "560068",
      "city": "Bengaluru",
      "state": "Karnataka",
      "country": "in"
    }
  },
  "line_items": [
    {
      "name": "Master Cloud Computing in 30 Days",
      "description": "Book by Ravena Ravenclaw",
      "amount": 100,
      "currency": "INR",
      "quantity": 1
    }
  ],
  "sms_notify": 1,
  "email_notify": 1,
  "currency": "INR",
  "expire_by": 1760714528
}
Example
Create an Invoice with Customer Details
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/invoices' \
--data-raw '{
  "type": "invoice",
  "description": "Invoice for the month of January 2020",
  "partial_payment": true,
  "customer": {
    "name": "Gaurav Kumar",
    "contact": 9000090000,
    "email": "gaurav.kumar@example.com",
    "billing_address": {
      "line1": "Ground & 1st Floor, SJR Cyber Laskar",
      "line2": "Hosur Road",
      "zipcode": "560068",
      "city": "Bengaluru",
      "state": "Karnataka",
      "country": "in"
    },
    "shipping_address": {
      "line1": "Ground & 1st Floor, SJR Cyber Laskar",
      "line2": "Hosur Road",
      "zipcode": "560068",
      "city": "Bengaluru",
      "state": "Karnataka",
      "country": "in"
    }
  },
  "line_items": [
    {
      "name": "Master Cloud Computing in 30 Days",
      "description": "Book by Ravena Ravenclaw",
      "amount": 100,
      "currency": "INR",
      "quantity": 1
    }
  ],
  "sms_notify": 1,
  "email_notify": 1,
  "currency": "INR",
  "expire_by": 1760714528
}'
200 OK
Response
Body
Headers (12)
View More
{
    "id": "inv_R7TudMwbXToFrS",
    "entity": "invoice",
    "receipt": null,
    "invoice_number": null,
    "customer_id": "cust_MbhRQ91zOiwkgt",
    "customer_details": {
        "id": "cust_MbhRQ91zOiwkgt",
        "name": "Gaurav Kumar",
        "email": "gaurav.kumar@example.com",
        "contact": "9000090000",
        "gstin": null,
        "billing_address": {
            "id": "addr_MbhRQBK5pm9JoC",
            "type": "billing_address",
            "primary": true,
            "line1": "Ground & 1st Floor, SJR Cyber Laskar",
            "line2": "Hosur Road",
            "zipcode": "560068",
            "city": "Bengaluru",
            "state": "Karnataka",
            "country": "in",
            "contact": null,
            "name": null,
            "tag": null,
            "landmark": null
        },
        "shipping_address": {
            "id": "addr_MbhRQAwCMTXzOm",
            "type": "shipping_address",
            "primary": true,
            "line1": "Ground & 1st Floor, SJR Cyber Laskar",
            "line2": "Hosur Road",
            "zipcode": "560068",
            "city": "Bengaluru",
            "state": "Karnataka",
            "country": "in",
            "contact": null,
            "name": null,
            "tag": null,
            "landmark": null
        },
        "customer_name": "Gaurav Kumar",
        "customer_email": "gaurav.kumar@example.com",
        "customer_contact": "9000090000"
    },
    "order_id": "order_R7TudYzGm3B43U",
    "line_items": [
        {
            "id": "li_R7TudPbZKjB7Br",
            "item_id": null,
            "ref_id": null,
            "ref_type": null,
            "name": "Master Cloud Computing in 30 Days",
            "description": "Book by Ravena Ravenclaw",
            "amount": 100,
            "unit_amount": 100,
            "gross_amount": 100,
            "tax_amount": 0,
            "taxable_amount": 100,
            "net_amount": 100,
            "currency": "INR",
            "type": "invoice",
            "tax_inclusive": false,
            "hsn_code": null,
            "sac_code": null,
            "tax_rate": null,
            "unit": null,
            "quantity": 1,
            "taxes": []
        }
    ],
    "payment_id": null,
    "status": "issued",
    "expire_by": 1760714528,
    "issued_at": 1755669461,
    "paid_at": null,
    "cancelled_at": null,
    "expired_at": null,
    "sms_status": "pending",
    "email_status": "pending",
    "date": 1755669461,
    "terms": null,
    "partial_payment": true,
    "gross_amount": 100,
    "tax_amount": 0,
    "taxable_amount": 100,
    "amount": 100,
    "amount_paid": 0,
    "amount_due": 100,
    "currency": "INR",
    "currency_symbol": "₹",
    "description": "Invoice for the month of January 2020",
    "notes": [],
    "comment": null,
    "short_url": "https://rzp.io/rzp/UFJvIJ2C",
    "view_less": true,
    "billing_start": null,
    "billing_end": null,
    "type": "invoice",
    "group_taxes_discounts": false,
    "created_at": 1755669461,
    "ref_num": null
}
PATCH
Update an Invoice
https://api.razorpay.com/v1/invoices/{inv_id}
You can use this API to update the details of the invoice.

Authorization
Basic Auth
Username
<username>
Password
<password>
Query Params
count
10
skip
10
Body
raw (json)
View More
json
{
    {
      "id": "li_DAweOizsysoJU6",
      "name": "Book / English August - Updated name and quantity",
      "quantity": 1
    },
    {
      "name": "Book / A Wild Sheep Chase",
      "amount": 200,
      "currency": "INR",
      "quantity": 1
    },
  "notes": {
    "updated-key": "An updated note."
  }
}
Example
Update an Invoice
Request
View More
cURL
curl --location --globoff --request PATCH 'https://api.razorpay.com/v1/invoices/{inv_id}' \
--header 'Content-Type: application/json' \
--data '{
    {
      "id": "li_DAweOizsysoJU6",
      "name": "Book / English August - Updated name and quantity",
      "quantity": 1
    },
    {
      "name": "Book / A Wild Sheep Chase",
      "amount": 200,
      "currency": "INR",
      "quantity": 1
    },
  "notes": {
    "updated-key": "An updated note."
  }
}'
200 OK
Response
Body
Headers (12)
View More
{
    "id": "inv_R7Tag79jwqa0tH",
    "entity": "invoice",
    "receipt": "0011",
    "invoice_number": "0011",
    "customer_id": "cust_R1bstJ8RVxwjpJ",
    "customer_details": {
        "id": "cust_R1bstJ8RVxwjpJ",
        "name": "Gaurav Kumar",
        "email": "gaurav.kumar@example.com",
        "contact": "9123456780",
        "gstin": "12ABCDE2356F7GH",
        "billing_address": {
            "id": "addr_R7TZpeJJ0D4ACF",
            "type": "billing_address",
            "primary": true,
            "line1": "Koramangala",
            "line2": "Koramangala",
            "zipcode": "560076",
            "city": "Bengaluru",
            "state": "Karnataka",
            "country": "in",
            "contact": null,
            "name": null,
            "tag": null,
            "landmark": null
        },
        "shipping_address": {
            "id": "addr_R7TZpeJJ0D4ACF",
            "type": "billing_address",
            "primary": true,
            "line1": "Koramangala",
            "line2": "Koramangala",
            "zipcode": "560076",
            "city": "Bengaluru",
            "state": "Karnataka",
            "country": "in",
            "contact": null,
            "name": null,
            "tag": null,
            "landmark": null
        },
        "customer_name": "Gaurav Kumar",
        "customer_email": "gaurav.kumar@example.com",
        "customer_contact": "9123456780"
    },
    "order_id": "order_R7Tagtt8Zlq384",
    "line_items": [
        {
            "id": "li_R7TagAJn8DUVqr",
            "item_id": "item_DOKzUzTvgGh8fr",
            "ref_id": null,
            "ref_type": null,
            "name": "testtttttt",
            "description": null,
            "amount": 1300,
            "unit_amount": 1300,
            "gross_amount": 6500,
            "tax_amount": 0,
            "taxable_amount": 6500,
            "net_amount": 6500,
            "currency": "INR",
            "type": "invoice",
            "tax_inclusive": false,
            "hsn_code": null,
            "sac_code": null,
            "tax_rate": null,
            "unit": null,
            "quantity": 5,
            "taxes": []
        }
    ],
    "payment_id": "pay_R7TbaF3nrBHYKI",
    "status": "paid",
    "expire_by": 1756664999,
    "issued_at": 1755668327,
    "paid_at": 1755668387,
    "cancelled_at": null,
    "expired_at": null,
    "sms_status": "sent",
    "email_status": "sent",
    "date": 1755667933,
    "terms": "Tuition Fee Tuition Fee",
    "partial_payment": false,
    "gross_amount": 6500,
    "tax_amount": 0,
    "taxable_amount": 6500,
    "amount": 6500,
    "amount_paid": 6500,
    "amount_due": 0,
    "currency": "INR",
    "currency_symbol": "₹",
    "description": "Tuition Fee",
    "notes": [],
    "comment": "Tuition Fee",
    "short_url": "https://rzp.io/rzp/7JO8M3H",
    "view_less": true,
    "billing_start": null,
    "billing_end": null,
    "type": "invoice",
    "group_taxes_discounts": false,
    "created_at": 1755668328,
    "idempotency_key": null,
    "ref_num": null
}
POST
Issue an Invoice
https://api.razorpay.com/v1/invoices/{inv_id}/issue
You can use this API to to issue invoices to your customers. Only an invoice in the draft state can be issued.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Issue an Invoice
Request
View More
cURL
curl --location --globoff --request POST 'https://api.razorpay.com/v1/invoices/{inv_id}/issue'
200 OK
Response
Body
Headers (12)
View More
{
    "id": "inv_R7UEHueEvtTNDZ",
    "entity": "invoice",
    "receipt": "0022",
    "invoice_number": "0022",
    "customer_id": "cust_R1bstJ8RVxwjpJ",
    "customer_details": {
        "id": "cust_R1bstJ8RVxwjpJ",
        "name": "Gaurav Kumar",
        "email": "gaurav.kumar@example.com",
        "contact": "9123456780",
        "gstin": "12ABCDE2356F7GH",
        "billing_address": {
            "id": "addr_R7TZpeJJ0D4ACF",
            "type": "billing_address",
            "primary": true,
            "line1": "Koramangala",
            "line2": "Koramangala",
            "zipcode": "560076",
            "city": "Bengaluru",
            "state": "Karnataka",
            "country": "in",
            "contact": null,
            "name": null,
            "tag": null,
            "landmark": null
        },
        "shipping_address": null,
        "customer_name": "Gaurav Kumar",
        "customer_email": "gaurav.kumar@example.com",
        "customer_contact": "9123456780"
    },
    "order_id": "order_R7UEiCobDSMnye",
    "line_items": [
        {
            "id": "li_R7UEHz0lKQ3LXa",
            "item_id": "item_DRt61i2NnL8oy6",
            "ref_id": null,
            "ref_type": null,
            "name": "Processing Fees",
            "description": null,
            "amount": 1000,
            "unit_amount": 1000,
            "gross_amount": 10000,
            "tax_amount": 0,
            "taxable_amount": 10000,
            "net_amount": 10000,
            "currency": "INR",
            "type": "invoice",
            "tax_inclusive": false,
            "hsn_code": null,
            "sac_code": null,
            "tax_rate": null,
            "unit": null,
            "quantity": 10,
            "taxes": []
        }
    ],
    "payment_id": null,
    "status": "issued",
    "expire_by": 1756664999,
    "issued_at": 1755670600,
    "paid_at": null,
    "cancelled_at": null,
    "expired_at": null,
    "sms_status": null,
    "email_status": null,
    "date": 1755667933,
    "terms": null,
    "partial_payment": false,
    "gross_amount": 10000,
    "tax_amount": 0,
    "taxable_amount": 10000,
    "amount": 10000,
    "amount_paid": 0,
    "amount_due": 10000,
    "currency": "INR",
    "currency_symbol": "₹",
    "description": "Tuition Fees",
    "notes": [],
    "comment": null,
    "short_url": "https://rzp.io/rzp/aqhQisk",
    "view_less": true,
    "billing_start": null,
    "billing_end": null,
    "type": "invoice",
    "group_taxes_discounts": false,
    "created_at": 1755670577,
    "idempotency_key": null,
    "ref_num": null
}
DELETE
Delete an Invoice
https://api.razorpay.com/v1/invoices/{inv_id}
You can use this API to delete invoices. You can only delete an invoice that is in the draft state.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Delete an Invoice
Request
View More
cURL
curl --location --globoff --request DELETE 'https://api.razorpay.com/v1/invoices/{inv_id}'
200 OK
Response
Body
Headers (12)
[]
POST
Cancel an Invoice
https://api.razorpay.com/v1/invoices/{inv_id}/cancel
You can use this API to cancel an invoice. Invoices in the paid state cannot be cancelled.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Cancel an Invoice
Request
View More
cURL
curl --location --globoff --request POST 'https://api.razorpay.com/v1/invoices/{inv_id}/cancel'
200 OK
Response
Body
Headers (12)
View More
{
    "id": "inv_R7TudMwbXToFrS",
    "entity": "invoice",
    "receipt": null,
    "invoice_number": null,
    "customer_id": "cust_MbhRQ91zOiwkgt",
    "customer_details": {
        "id": "cust_MbhRQ91zOiwkgt",
        "name": "Gaurav Kumar",
        "email": "gaurav.kumar@example.com",
        "contact": "9000090000",
        "gstin": null,
        "billing_address": {
            "id": "addr_MbhRQBK5pm9JoC",
            "type": "billing_address",
            "primary": true,
            "line1": "Ground & 1st Floor, SJR Cyber Laskar",
            "line2": "Hosur Road",
            "zipcode": "560068",
            "city": "Bengaluru",
            "state": "Karnataka",
            "country": "in",
            "contact": null,
            "name": null,
            "tag": null,
            "landmark": null
        },
        "shipping_address": {
            "id": "addr_MbhRQAwCMTXzOm",
            "type": "shipping_address",
            "primary": true,
            "line1": "Ground & 1st Floor, SJR Cyber Laskar",
            "line2": "Hosur Road",
            "zipcode": "560068",
            "city": "Bengaluru",
            "state": "Karnataka",
            "country": "in",
            "contact": null,
            "name": null,
            "tag": null,
            "landmark": null
        },
        "customer_name": "Gaurav Kumar",
        "customer_email": "gaurav.kumar@example.com",
        "customer_contact": "9000090000"
    },
    "order_id": "order_R7TudYzGm3B43U",
    "line_items": [
        {
            "id": "li_R7TudPbZKjB7Br",
            "item_id": null,
            "ref_id": null,
            "ref_type": null,
            "name": "Master Cloud Computing in 30 Days",
            "description": "Book by Ravena Ravenclaw",
            "amount": 100,
            "unit_amount": 100,
            "gross_amount": 100,
            "tax_amount": 0,
            "taxable_amount": 100,
            "net_amount": 100,
            "currency": "INR",
            "type": "invoice",
            "tax_inclusive": false,
            "hsn_code": null,
            "sac_code": null,
            "tax_rate": null,
            "unit": null,
            "quantity": 1,
            "taxes": []
        }
    ],
    "payment_id": null,
    "status": "cancelled",
    "expire_by": 1760714528,
    "issued_at": 1755669461,
    "paid_at": null,
    "cancelled_at": 1755670974,
    "expired_at": null,
    "sms_status": "sent",
    "email_status": "sent",
    "date": 1755669461,
    "terms": null,
    "partial_payment": true,
    "gross_amount": 100,
    "tax_amount": 0,
    "taxable_amount": 100,
    "amount": 100,
    "amount_paid": 0,
    "amount_due": 100,
    "currency": "INR",
    "currency_symbol": "₹",
    "description": "Invoice for the month of January 2020",
    "notes": [],
    "comment": null,
    "short_url": "https://rzp.io/rzp/UFJvIJ2C",
    "view_less": true,
    "billing_start": null,
    "billing_end": null,
    "type": "invoice",
    "group_taxes_discounts": false,
    "created_at": 1755669461,
    "idempotency_key": null,
    "ref_num": null
}
GET
Fetch an Invoice With ID
https://api.razorpay.com/v1/invoices/{inv_id}
You can use this API to retrieve all the details of an invoice.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch an Invoice With ID
Request
cURL
curl --location --globoff 'https://api.razorpay.com/v1/invoices/{inv_id}'
200 OK
Response
Body
Headers (13)
View More
{
    "id": "inv_R7Tag79jwqa0tH",
    "entity": "invoice",
    "receipt": "0011",
    "invoice_number": "0011",
    "customer_id": "cust_R1bstJ8RVxwjpJ",
    "customer_details": {
        "id": "cust_R1bstJ8RVxwjpJ",
        "name": "Gaurav Kumar",
        "email": "gaurav.kumar@example.com",
        "contact": "9123456780",
        "gstin": "12ABCDE2356F7GH",
        "billing_address": {
            "id": "addr_R7TZpeJJ0D4ACF",
            "type": "billing_address",
            "primary": true,
            "line1": "Koramangala",
            "line2": "Koramangala",
            "zipcode": "560076",
            "city": "Bengaluru",
            "state": "Karnataka",
            "country": "in",
            "contact": null,
            "name": null,
            "tag": null,
            "landmark": null
        },
        "shipping_address": {
            "id": "addr_R7TZpeJJ0D4ACF",
            "type": "billing_address",
            "primary": true,
            "line1": "Koramangala",
            "line2": "Koramangala",
            "zipcode": "560076",
            "city": "Bengaluru",
            "state": "Karnataka",
            "country": "in",
            "contact": null,
            "name": null,
            "tag": null,
            "landmark": null
        },
        "customer_name": "Gaurav Kumar",
        "customer_email": "gaurav.kumar@example.com",
        "customer_contact": "9123456780"
    },
    "order_id": "order_R7Tagtt8Zlq384",
    "line_items": [
        {
            "id": "li_R7TagAJn8DUVqr",
            "item_id": "item_DOKzUzTvgGh8fr",
            "ref_id": null,
            "ref_type": null,
            "name": "testtttttt",
            "description": null,
            "amount": 1300,
            "unit_amount": 1300,
            "gross_amount": 6500,
            "tax_amount": 0,
            "taxable_amount": 6500,
            "net_amount": 6500,
            "currency": "INR",
            "type": "invoice",
            "tax_inclusive": false,
            "hsn_code": null,
            "sac_code": null,
            "tax_rate": null,
            "unit": null,
            "quantity": 5,
            "taxes": []
        }
    ],
    "payment_id": "pay_R7TbaF3nrBHYKI",
    "status": "paid",
    "expire_by": 1756664999,
    "issued_at": 1755668327,
    "paid_at": 1755668387,
    "cancelled_at": null,
    "expired_at": null,
    "sms_status": "sent",
    "email_status": "sent",
    "date": 1755667933,
    "terms": "Tuition Fee Tuition Fee",
    "partial_payment": false,
    "gross_amount": 6500,
    "tax_amount": 0,
    "taxable_amount": 6500,
    "amount": 6500,
    "amount_paid": 6500,
    "amount_due": 0,
    "currency": "INR",
    "currency_symbol": "₹",
    "description": "Tuition Fee",
    "notes": [],
    "comment": "Tuition Fee",
    "short_url": "https://rzp.io/rzp/7JO8M3H",
    "view_less": true,
    "billing_start": null,
    "billing_end": null,
    "type": "invoice",
    "group_taxes_discounts": false,
    "created_at": 1755668328,
    "idempotency_key": null,
    "ref_num": null
}
GET
Fetch All Invoices
https://api.razorpay.com/v1/invoices
You can use this API to retrieve the details of all invoices.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch All Invoices
Request
cURL
curl --location 'https://api.razorpay.com/v1/invoices'
200 OK
Response
Body
Headers (13)
View More
{
    "entity": "collection",
    "count": 2,
    "items": [
        {
            "id": "inv_R7UEHueEvtTNDZ",
            "entity": "invoice",
            "receipt": "0022",
            "invoice_number": "0022",
            "customer_id": "cust_R1bstJ8RVxwjpJ",
            "customer_details": {
                "id": "cust_R1bstJ8RVxwjpJ",
                "name": "Gaurav Kumar",
                "email": "gaurav.kumar@example.com",
                "contact": "9123456780",
                "gstin": "12ABCDE2356F7GH",
                "billing_address": {
                    "id": "addr_R7TZpeJJ0D4ACF",
                    "type": "billing_address",
                    "primary": true,
                    "line1": "Koramangala",
                    "line2": "Koramangala",
                    "zipcode": "560076",
                    "city": "Bengaluru",
                    "state": "Karnataka",
                    "country": "in",
                    "contact": null,
                    "name": null,
                    "tag": null,
                    "landmark": null
                },
                "shipping_address": null,
                "customer_name": "Gaurav Kumar",
                "customer_email": "gaurav.kumar@example.com",
                "customer_contact": "9123456780"
            },
            "order_id": "order_R7UEiCobDSMnye",
            "line_items": [
                {
                    "id": "li_R7UEHz0lKQ3LXa",
                    "item_id": "item_DRt61i2NnL8oy6",
                    "ref_id": null,
                    "ref_type": null,
                    "name": "Processing Fees",
                    "description": null,
                    "amount": 1000,
                    "unit_amount": 1000,
                    "gross_amount": 10000,
                    "tax_amount": 0,
                    "taxable_amount": 10000,
                    "net_amount": 10000,
                    "currency": "INR",
                    "type": "invoice",
                    "tax_inclusive": false,
                    "hsn_code": null,
                    "sac_code": null,
                    "tax_rate": null,
                    "unit": null,
                    "quantity": 10,
                    "taxes": []
                }
            ],
            "payment_id": null,
            "status": "issued",
            "expire_by": 1756664999,
            "issued_at": 1755670600,
            "paid_at": null,
            "cancelled_at": null,
            "expired_at": null,
            "sms_status": null,
            "email_status": null,
            "date": 1755667933,
            "terms": null,
            "partial_payment": false,
            "gross_amount": 10000,
            "tax_amount": 0,
            "taxable_amount": 10000,
            "amount": 10000,
            "amount_paid": 0,
            "amount_due": 10000,
            "currency": "INR",
            "currency_symbol": "₹",
            "description": "Tuition Fees",
            "notes": [],
            "comment": null,
            "short_url": "https://rzp.io/rzp/aqhQisk",
            "view_less": true,
            "billing_start": null,
            "billing_end": null,
            "type": "invoice",
            "group_taxes_discounts": false,
            "created_at": 1755670577,
            "idempotency_key": null,
            "ref_num": null
        },
        {
            "id": "inv_R7TudMwbXToFrS",
            "entity": "invoice",
            "receipt": null,
            "invoice_number": null,
            "customer_id": "cust_MbhRQ91zOiwkgt",
            "customer_details": {
                "id": "cust_MbhRQ91zOiwkgt",
                "name": "Gaurav Kumar",
                "email": "gaurav.kumar@example.com",
                "contact": "9000090000",
                "gstin": null,
                "billing_address": {
                    "id": "addr_MbhRQBK5pm9JoC",
                    "type": "billing_address",
                    "primary": true,
                    "line1": "Ground & 1st Floor, SJR Cyber Laskar",
                    "line2": "Hosur Road",
                    "zipcode": "560068",
                    "city": "Bengaluru",
                    "state": "Karnataka",
                    "country": "in",
                    "contact": null,
                    "name": null,
                    "tag": null,
                    "landmark": null
                },
                "shipping_address": {
                    "id": "addr_MbhRQAwCMTXzOm",
                    "type": "shipping_address",
                    "primary": true,
                    "line1": "Ground & 1st Floor, SJR Cyber Laskar",
                    "line2": "Hosur Road",
                    "zipcode": "560068",
                    "city": "Bengaluru",
                    "state": "Karnataka",
                    "country": "in",
                    "contact": null,
                    "name": null,
                    "tag": null,
                    "landmark": null
                },
                "customer_name": "Gaurav Kumar",
                "customer_email": "gaurav.kumar@example.com",
                "customer_contact": "9000090000"
            },
            "order_id": "order_R7TudYzGm3B43U",
            "line_items": [
                {
                    "id": "li_R7TudPbZKjB7Br",
                    "item_id": null,
                    "ref_id": null,
                    "ref_type": null,
                    "name": "Master Cloud Computing in 30 Days",
                    "description": "Book by Ravena Ravenclaw",
                    "amount": 100,
                    "unit_amount": 100,
                    "gross_amount": 100,
                    "tax_amount": 0,
                    "taxable_amount": 100,
                    "net_amount": 100,
                    "currency": "INR",
                    "type": "invoice",
                    "tax_inclusive": false,
                    "hsn_code": null,
                    "sac_code": null,
                    "tax_rate": null,
                    "unit": null,
                    "quantity": 1,
                    "taxes": []
                }
            ],
            "payment_id": null,
            "status": "cancelled",
            "expire_by": 1760714528,
            "issued_at": 1755669461,
            "paid_at": null,
            "cancelled_at": 1755670974,
            "expired_at": null,
            "sms_status": "sent",
            "email_status": "sent",
            "date": 1755669461,
            "terms": null,
            "partial_payment": true,
            "gross_amount": 100,
            "tax_amount": 0,
            "taxable_amount": 100,
            "amount": 100,
            "amount_paid": 0,
            "amount_due": 100,
            "currency": "INR",
            "currency_symbol": "₹",
            "description": "Invoice for the month of January 2020",
            "notes": [],
            "comment": null,
            "short_url": "https://rzp.io/rzp/UFJvIJ2C",
            "view_less": true,
            "billing_start": null,
            "billing_end": null,
            "type": "invoice",
            "group_taxes_discounts": false,
            "created_at": 1755669461,
            "idempotency_key": null,
            "ref_num": null
        }
    ]
}
POST
Send Notifications
https://api.razorpay.com/v1/invoices/{inv_id}/notify_by/{medium}
You can use this API to send notifications with the short URL to the customer via email or SMS.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Send Notifications
Request
View More
cURL
curl --location --globoff --request POST 'https://api.razorpay.com/v1/invoices/{inv_id}/notify_by/{medium}'
200 OK
Response
Body
Headers (12)
{
    "success": true
}
Items APIs
Items are products or services that you bill customers for by adding them to an invoice. You can create an item using APIs. When an item is created, it will appear on the list of items in the Dashboard.

Know more about Items APIs.

List of APIs
﻿Create an Item﻿
﻿Fetch Item With ID﻿
﻿Fetch All Items﻿
﻿Update an Item﻿
﻿Delete an Item﻿
Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
POST
Create an Item
https://api.razorpay.com/v1/items
You can use this API to create an item with basic details such as name and amount.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
json
{
    "name": "Yellow Herb",
    "description": "Yellow herb from Resident Evil",
    "amount": 10000,
    "currency": "INR"
}
Example
Create an Item
Request
cURL
curl --location 'https://api.razorpay.com/v1/items' \
--header 'Content-Type: application/json' \
--data '{
    "name": "Yellow Herb",
    "description": "Yellow herb from Resident Evil",
    "amount": 10000,
    "currency": "INR"
}'
200 OK
Response
Body
Headers (12)
View More
{
    "id": "item_R7Tq1FYn5XGUUw",
    "active": true,
    "name": "Yellow Herb",
    "description": "Yellow herb from Resident Evil",
    "amount": 10000,
    "unit_amount": 10000,
    "currency": "INR",
    "type": "invoice",
    "unit": null,
    "tax_inclusive": false,
    "hsn_code": null,
    "sac_code": null,
    "tax_rate": null,
    "tax_id": null,
    "tax_group_id": null,
    "created_at": 1755669199
}
GET
Fetch Item With ID
https://api.razorpay.com/v1/items/{item_id}
You can use this API to to retrieve the details of a specific item using the Item_id.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch Item With ID
Request
cURL
curl --location --globoff 'https://api.razorpay.com/v1/items/{item_id}' \
--header 'Content-Type: application/json' \
--data ''
200 OK
Response
Body
Headers (12)
View More
{
    "id": "item_R7Tq1FYn5XGUUw",
    "active": true,
    "name": "Yellow Herb",
    "description": "Yellow herb from Resident Evil",
    "amount": 10000,
    "unit_amount": 10000,
    "currency": "INR",
    "type": "invoice",
    "unit": null,
    "tax_inclusive": false,
    "hsn_code": null,
    "sac_code": null,
    "tax_rate": null,
    "tax_id": null,
    "tax_group_id": null,
    "created_at": 1755669199
}
GET
Fetch All Items
https://api.razorpay.com/v1/items
You can use this API to retrieve the details of all the items created till date.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch All Items
Request
cURL
curl --location 'https://api.razorpay.com/v1/items' \
--header 'Content-Type: application/json' \
--data ''
200 OK
Response
Body
Headers (12)
View More
{
    "entity": "collection",
    "count": 2,
    "items": [
        {
            "id": "item_R7Tq1FYn5XGUUw",
            "active": true,
            "name": "Yellow Herb",
            "description": "Yellow herb from Resident Evil",
            "amount": 10000,
            "unit_amount": 10000,
            "currency": "INR",
            "type": "invoice",
            "unit": null,
            "tax_inclusive": false,
            "hsn_code": null,
            "sac_code": null,
            "tax_rate": null,
            "tax_id": null,
            "tax_group_id": null,
            "created_at": 1755669199
        },
        {
            "id": "item_QnGKtqGkTCjWgL",
            "active": true,
            "name": "Amount",
            "description": null,
            "amount": 1200,
            "unit_amount": 1200,
            "currency": "INR",
            "type": "payment_page",
            "unit": null,
            "tax_inclusive": false,
            "hsn_code": null,
            "sac_code": null,
            "tax_rate": null,
            "tax_id": null,
            "tax_group_id": null,
            "created_at": 1751254848
        }
    ]
}
PATCH
Update an Item
https://api.razorpay.com/v1/items/{item_id}
You can use this API to update the details of an item.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
json
{
    "name": "Green Herb",
    "description": "Green herb from Resident Evil",
    "amount": 70000,
    "currency": "INR"
}
Example
Update an Item
Request
View More
cURL
curl --location --globoff --request PATCH 'https://api.razorpay.com/v1/items/{item_id}' \
--header 'Content-Type: application/json' \
--data '{
    "name": "Green Herb",
    "description": "Green herb from Resident Evil",
    "amount": 70000,
    "currency": "INR"
}'
200 OK
Response
Body
Headers (12)
View More
{
    "id": "item_R7Tq1FYn5XGUUw",
    "active": true,
    "name": "Green Herb",
    "description": "Green herb from Resident Evil",
    "amount": 70000,
    "unit_amount": 70000,
    "currency": "INR",
    "type": "invoice",
    "unit": null,
    "tax_inclusive": false,
    "hsn_code": null,
    "sac_code": null,
    "tax_rate": null,
    "tax_id": null,
    "tax_group_id": null,
    "created_at": 1755669199
}
DELETE
Delete an Item
https://api.razorpay.com/v1/items/{item_id}
You can use this API to delete an item.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Delete an Item
Request
View More
cURL
curl --location --globoff --request DELETE 'https://api.razorpay.com/v1/items/{item_id}' \
--header 'Content-Type: application/json' \
--data ''
200 OK
Response
Body
Headers (12)
[]
Subscriptions APIs
You can use Subscriptions to charge a customer periodically. A Subscription contains details like the plan, the start date, the total number of billing cycles, the free trial period (if any) and the upfront amount to be collected.

List of APIs
﻿Plan APIs﻿
﻿Subscription APIs﻿
Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
Step 1 - Plans
A plan is a foundation on which a subscription is built. It acts as a reusable template and contains details of the goods or services offered, the amount to be charged and the frequency at which the customer should be charged (billing cycle). Depending upon your business, you can create multiple plans with different billing cycles and pricing.

List of APIs
﻿﻿Create a Plan﻿
﻿﻿Fetch All Plans﻿
﻿Fetch a Plan With ID﻿
Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
POST
Create a Plan
https://api.razorpay.com/v1/plans
You can use this API to create a plan.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
View More
json
{
  "period": "weekly",
  "interval": 1,
  "item": {
    "name": "Test plan - Weekly",
    "amount": 69900,
    "currency": "INR",
    "description": "Description for the test plan - Weekly"
  },
  "notes": {
    "notes_key_1": "Tea, Earl Grey, Hot",
    "notes_key_2": "Tea, Earl Grey… decaf."
  }
}
Example
Create a Plan
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/plans' \
--header 'Content-Type: application/json' \
--data '{
  "period": "weekly",
  "interval": 1,
  "item": {
    "name": "Test plan - Weekly",
    "amount": 69900,
    "currency": "INR",
    "description": "Description for the test plan - Weekly"
  },
  "notes": {
    "notes_key_1": "Tea, Earl Grey, Hot",
    "notes_key_2": "Tea, Earl Grey… decaf."
  }
}'
200 OK
Response
Body
Headers (12)
View More
{
    "id": "plan_R7XHApPVsWrCZv",
    "entity": "plan",
    "interval": 1,
    "period": "weekly",
    "item": {
        "id": "item_R7XHAonIXNxGC7",
        "active": true,
        "name": "Test plan - Weekly",
        "description": "Description for the test plan - Weekly",
        "amount": 69900,
        "unit_amount": 69900,
        "currency": "INR",
        "type": "plan",
        "unit": null,
        "tax_inclusive": false,
        "hsn_code": null,
        "sac_code": null,
        "tax_rate": null,
        "tax_id": null,
        "tax_group_id": null,
        "created_at": 1755681306,
        "updated_at": 1755681306
    },
    "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
    },
    "created_at": 1755681306
}
GET
Fetch All Plans
https://api.razorpay.com/v1/plans
You can use this API to fetch details of all plans.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch All Plans
Request
cURL
curl --location 'https://api.razorpay.com/v1/plans'
200 OK
Response
Body
Headers (12)
View More
{
    "entity": "collection",
    "count": 2,
    "items": [
        {
            "id": "plan_R7XHApPVsWrCZv",
            "entity": "plan",
            "interval": 1,
            "period": "weekly",
            "item": {
                "id": "item_R7XHAonIXNxGC7",
                "active": true,
                "name": "Test plan - Weekly",
                "description": "Description for the test plan - Weekly",
                "amount": 69900,
                "unit_amount": 69900,
                "currency": "INR",
                "type": "plan",
                "unit": null,
                "tax_inclusive": false,
                "hsn_code": null,
                "sac_code": null,
                "tax_rate": null,
                "tax_id": null,
                "tax_group_id": null,
                "created_at": 1755681306,
                "updated_at": 1755681306
            },
            "notes": {
                "notes_key_1": "Tea, Earl Grey, Hot",
                "notes_key_2": "Tea, Earl Grey… decaf."
            },
            "created_at": 1755681306
        },
        {
            "id": "plan_QikV0PLGweXtlA",
            "entity": "plan",
            "interval": 1,
            "period": "monthly",
            "item": {
                "id": "item_QikV0OqH7DPtjB",
                "active": true,
                "name": "elite",
                "description": "elite plan",
                "amount": 3000,
                "unit_amount": 3000,
                "currency": "INR",
                "type": "plan",
                "unit": null,
                "tax_inclusive": false,
                "hsn_code": null,
                "sac_code": null,
                "tax_rate": null,
                "tax_id": null,
                "tax_group_id": null,
                "created_at": 1750269370,
                "updated_at": 1750269370
            },
            "notes": {
                "notes_key_1": "elite plan for individual",
                "notes_key_2": "elite plan for individual1"
            },
            "created_at": 1750269370
        }
    ]
}
GET
Fetch a Plan With ID
https://api.razorpay.com/v1/plans/{plan_id}
You can use this API to retrieve the details of a plan using its unique identifier.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch a Plan With ID
Request
cURL
curl --location --globoff 'https://api.razorpay.com/v1/plans/{plan_id}'
200 OK
Response
Body
Headers (12)
View More
{
    "id": "plan_R7XHApPVsWrCZv",
    "entity": "plan",
    "interval": 1,
    "period": "weekly",
    "item": {
        "id": "item_R7XHAonIXNxGC7",
        "active": true,
        "name": "Test plan - Weekly",
        "description": "Description for the test plan - Weekly",
        "amount": 69900,
        "unit_amount": 69900,
        "currency": "INR",
        "type": "plan",
        "unit": null,
        "tax_inclusive": false,
        "hsn_code": null,
        "sac_code": null,
        "tax_rate": null,
        "tax_id": null,
        "tax_group_id": null,
        "created_at": 1755681306,
        "updated_at": 1755681306
    },
    "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
    },
    "created_at": 1755681306
}
Step 2 - Subscriptions
Subscriptions allow you to charge a customer's card periodically. A subscription ties a customer to a particular plan you have created. It contains details like the plan, the start date, total number of billing cycles, free trial period (if any) and upfront amount to be collected.

List of APIs
﻿﻿Create a Subscription﻿
﻿﻿Create a Subscription Link﻿
﻿﻿Fetch All Subscriptions﻿
﻿﻿Fetch a Subscription With ID﻿
﻿﻿Cancel a Subscription﻿
﻿﻿Update a Subscription﻿
﻿﻿Fetch Details of a Pending Update﻿
﻿﻿Cancel an Update﻿
﻿﻿Pause a Subscription﻿
﻿﻿Resume a Subscription﻿
﻿﻿Fetch All Invoices for a Subscription﻿
﻿Link an Offer to a Subscription﻿
﻿Delete an Offer Linked to a Subscription﻿
Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
POST
Create a Subscription
https://api.razorpay.com/v1/subscriptions
You can use this API to create a Subscription.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
View More
json
{
  "plan_id":"plan_QikV0PLGweXtlA",
  "total_count":3,
  "quantity":1,
  "start_at":1935689600,
  "expire_by":1893456000,
  "customer_notify":1,
  "addons":[
    {
      "item":{
        "name":"Delivery charges",
        "amount":9000,
        "currency":"INR"
      }
    }
  ],
  "notes":{
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  }
}
Example
Create a Subscription
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/subscriptions' \
--header 'Content-Type: application/json' \
--data '{
  "plan_id":"plan_QikV0PLGweXtlA",
  "total_count":3,
  "quantity":1,
  "start_at":1935689600,
  "expire_by":1893456000,
  "customer_notify":1,
  "addons":[
    {
      "item":{
        "name":"Delivery charges",
        "amount":9000,
        "currency":"INR"
      }
    }
  ],
  "notes":{
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  }
}'
200 OK
Response
Body
Headers (12)
View More
{
    "id": "sub_R7Xn62Px0KDNz1",
    "entity": "subscription",
    "plan_id": "plan_QikV0PLGweXtlA",
    "status": "created",
    "current_start": null,
    "current_end": null,
    "ended_at": null,
    "quantity": 1,
    "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
    },
    "charge_at": 1935689600,
    "start_at": 1935689600,
    "end_at": 1940956200,
    "auth_attempts": 0,
    "total_count": 3,
    "paid_count": 0,
    "customer_notify": true,
    "created_at": 1755683119,
    "expire_by": 1893456000,
    "short_url": "https://rzp.io/rzp/0gA97Ly",
    "has_scheduled_changes": false,
    "change_scheduled_at": null,
    "source": "api",
    "remaining_count": 3
}
POST
Create a Subscription Link
https://api.razorpay.com/v1/subscriptions
You can use this API to create a Subscription link.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
View More
json
{
  "plan_id":"plan_QikV0PLGweXtlA",
  "total_count":12,
  "quantity":1,
  "start_at":1935689600,
  "expire_by":1893456000,
  "customer_notify":1,
  "addons":[
    {
      "item":{
        "name":"Delivery charges",
        "amount":9000,
        "currency":"INR"
      }
    }
  ],
  "notes":{
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  },
  "notify_info":{
    "notify_phone":"9123456789",
    "notify_email":"gaurav.kumar@example.com"
  }
}
Example
Create a Subscription Link
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/subscriptions' \
--header 'Content-Type: application/json' \
--data-raw '{
  "plan_id":"plan_QikV0PLGweXtlA",
  "total_count":12,
  "quantity":1,
  "start_at":1935689600,
  "expire_by":1893456000,
  "customer_notify":1,
  "addons":[
    {
      "item":{
        "name":"Delivery charges",
        "amount":9000,
        "currency":"INR"
      }
    }
  ],
  "notes":{
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  },
  "notify_info":{
    "notify_phone":"9123456789",
    "notify_email":"gaurav.kumar@example.com"
  }
}'
200 OK
Response
Body
Headers (12)
View More
{
    "id": "sub_R7XrMt3IYRexbn",
    "entity": "subscription",
    "plan_id": "plan_QikV0PLGweXtlA",
    "status": "created",
    "current_start": null,
    "current_end": null,
    "ended_at": null,
    "quantity": 1,
    "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
    },
    "charge_at": 1935689600,
    "start_at": 1935689600,
    "end_at": 1964716200,
    "auth_attempts": 0,
    "total_count": 12,
    "paid_count": 0,
    "customer_notify": true,
    "created_at": 1755683362,
    "expire_by": 1893456000,
    "short_url": "https://rzp.io/rzp/82otgta",
    "has_scheduled_changes": false,
    "change_scheduled_at": null,
    "source": "api",
    "remaining_count": 12
}
GET
Fetch All Subscriptions
https://api.razorpay.com/v1/subscriptions
You can use this API to fetch all the created Subscriptions.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch All Subscriptions
Request
cURL
curl --location 'https://api.razorpay.com/v1/subscriptions'
200 OK
Response
Body
Headers (12)
View More
{
    "entity": "collection",
    "count": 2,
    "items": [
        {
            "id": "sub_R7XrMt3IYRexbn",
            "entity": "subscription",
            "plan_id": "plan_QikV0PLGweXtlA",
            "customer_id": null,
            "status": "created",
            "current_start": null,
            "current_end": null,
            "ended_at": null,
            "quantity": 1,
            "notes": {
                "notes_key_1": "Tea, Earl Grey, Hot",
                "notes_key_2": "Tea, Earl Grey… decaf."
            },
            "charge_at": 1935689600,
            "start_at": 1935689600,
            "end_at": 1964716200,
            "auth_attempts": 0,
            "total_count": 12,
            "paid_count": 0,
            "customer_notify": true,
            "created_at": 1755683362,
            "expire_by": 1893456000,
            "short_url": "https://rzp.io/rzp/82otgta",
            "has_scheduled_changes": false,
            "change_scheduled_at": null,
            "source": "api",
            "payment_method": null,
            "offer_id": null,
            "remaining_count": 12
        },
        {
            "id": "sub_R7Xq7lvJT4RLwj",
            "entity": "subscription",
            "plan_id": "plan_QikV0PLGweXtlA",
            "customer_id": null,
            "status": "created",
            "current_start": null,
            "current_end": null,
            "ended_at": null,
            "quantity": 1,
            "notes": {
                "notes_key_1": "Tea, Earl Grey, Hot",
                "notes_key_2": "Tea, Earl Grey… decaf."
            },
            "charge_at": 1935689600,
            "start_at": 1935689600,
            "end_at": 1964716200,
            "auth_attempts": 0,
            "total_count": 12,
            "paid_count": 0,
            "customer_notify": true,
            "created_at": 1755683291,
            "expire_by": 1893456000,
            "short_url": "https://rzp.io/rzp/CHUlNIvX",
            "has_scheduled_changes": false,
            "change_scheduled_at": null,
            "source": "api",
            "payment_method": null,
            "offer_id": null,
            "remaining_count": 12
        }
    ]
}
GET
Fetch a Subscription With ID
https://api.razorpay.com/v1/subscriptions/{sub_id}
You can use this API to fetch a Subscription by the unique identifier.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch a Subscription With ID
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/subscriptions/{sub_id}'
200 OK
Response
Body
Headers (12)
View More
{
    "id": "sub_R7Xn62Px0KDNz1",
    "entity": "subscription",
    "plan_id": "plan_QikV0PLGweXtlA",
    "customer_id": null,
    "status": "created",
    "current_start": null,
    "current_end": null,
    "ended_at": null,
    "quantity": 1,
    "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
    },
    "charge_at": 1935689600,
    "start_at": 1935689600,
    "end_at": 1940956200,
    "auth_attempts": 0,
    "total_count": 3,
    "paid_count": 0,
    "customer_notify": true,
    "created_at": 1755683119,
    "expire_by": 1893456000,
    "short_url": "https://rzp.io/rzp/0gA97Ly",
    "has_scheduled_changes": false,
    "change_scheduled_at": null,
    "source": "api",
    "payment_method": null,
    "offer_id": null,
    "remaining_count": 3
}
POST
Cancel a Subscription
https://api.razorpay.com/v1/subscriptions/{sub_id}/cancel
You can use this API to cancel a Subscription.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
json
{
    "cancel_at_cycle_end": 0
}
Example
Cancel a Subscription
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/subscriptions/{sub_id}/cancel' \
--header 'Content-Type: application/json' \
--data '{
    "cancel_at_cycle_end": 0
}'
200 OK
Response
Body
Headers (12)
View More
{
    "id": "sub_R7YTroWQOhq4gi",
    "entity": "subscription",
    "plan_id": "plan_QWNrmY0FWVDcrk",
    "customer_id": null,
    "status": "cancelled",
    "current_start": 1755685581,
    "current_end": 1758306600,
    "ended_at": 1755685757,
    "quantity": 2,
    "notes": [],
    "charge_at": null,
    "start_at": 1755685581,
    "end_at": 1758306600,
    "auth_attempts": 0,
    "total_count": 2,
    "paid_count": 1,
    "customer_notify": true,
    "created_at": 1755685548,
    "expire_by": null,
    "short_url": "https://rzp.io/rzp/zHH2Ypy",
    "has_scheduled_changes": false,
    "change_scheduled_at": null,
    "source": "dashboard",
    "payment_method": "card",
    "offer_id": null,
    "remaining_count": 1
}
PATCH
Update a Subscription
https://api.razorpay.com/v1/subscriptions/sub_R7YTroWQOhq4gi
You can use this API to update a Subscription.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
json
{
  "plan_id": "sub_R7YTroWQOhq4gi",
  "quantity": 2,
  "remaining_count": 1,
  "schedule_change_at": "now",
  "customer_notify": 1
}
GET
Fetch Details of a Pending Update
https://api.razorpay.com/v1/subscriptions/sub_R7YdfqPam82iv7/retrieve_scheduled_changes
You can use this API to retrieve details of a pending update. This happens when a Subscription is updated using the end of cycle option for the schedule_change_at parameter.

Authorization
Basic Auth
Username
<username>
Password
<password>
POST
Cancel an Update
https://api.razorpay.com/v1/subscriptions/{sub_id}/cancel_scheduled_changes
You can use this API to cancel a pending update.

Authorization
Basic Auth
Username
<username>
Password
<password>
POST
Pause a Subscription
https://api.razorpay.com/v1/subscriptions/{sub_id}/pause
You can use this API to pause a Subscription.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
json
{
  "pause_at":"now"
}
Example
Pause a Subscription
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/subscriptions/{sub_id}/pause' \
--data '{
  "pause_at":"now"
}'
200 OK
Response
Body
Headers (12)
View More
{
    "id": "sub_R7XhHun7FTpu01",
    "entity": "subscription",
    "plan_id": "plan_QikV0PLGweXtlA",
    "customer_id": null,
    "status": "paused",
    "current_start": 1755684904,
    "current_end": 1758306600,
    "ended_at": null,
    "quantity": 3,
    "notes": [],
    "charge_at": null,
    "start_at": 1755684904,
    "end_at": 1760898600,
    "auth_attempts": 0,
    "total_count": 3,
    "paid_count": 1,
    "customer_notify": true,
    "created_at": 1755682789,
    "expire_by": null,
    "short_url": "https://rzp.io/rzp/eyTUIXyY",
    "has_scheduled_changes": false,
    "change_scheduled_at": null,
    "source": "dashboard",
    "payment_method": "card",
    "offer_id": null,
    "remaining_count": 2
}
POST
Resume a Subscription
https://api.razorpay.com/v1/subscriptions/{sub_id}/resume
You can use this API to resume a Subscription.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
json
{
  "resume_at":"now"
}
Example
Resume a Subscription
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/subscriptions/{sub_id}/resume' \
--data '{
  "resume_at":"now"
}'
200 OK
Response
Body
Headers (12)
View More
{
    "id": "sub_R7XhHun7FTpu01",
    "entity": "subscription",
    "plan_id": "plan_QikV0PLGweXtlA",
    "customer_id": null,
    "status": "active",
    "current_start": 1755684904,
    "current_end": 1758306600,
    "ended_at": null,
    "quantity": 3,
    "notes": [],
    "charge_at": 1758306600,
    "start_at": 1755684904,
    "end_at": 1760898600,
    "auth_attempts": 0,
    "total_count": 3,
    "paid_count": 1,
    "customer_notify": true,
    "created_at": 1755682789,
    "expire_by": null,
    "short_url": "https://rzp.io/rzp/eyTUIXyY",
    "has_scheduled_changes": false,
    "change_scheduled_at": null,
    "source": "dashboard",
    "payment_method": "card",
    "offer_id": null,
    "remaining_count": 2
}
GET
Fetch All Invoices for a Subscription
https://api.razorpay.com/v1//invoices?subscription_id={sub_id}
You can use this API to retrieve all invoices of a Subscription.

Authorization
Basic Auth
Username
<username>
Password
<password>
Query Params
subscription_id
{sub_id}
Example
Fetch All Invoices for a Subscription
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1//invoices?subscription_id={sub_id}'
200 OK
Response
Body
Headers (13)
View More
{
    "entity": "collection",
    "count": 1,
    "items": [
        {
            "id": "inv_R7XhIZ4VCravir",
            "entity": "invoice",
            "receipt": null,
            "invoice_number": null,
            "customer_id": null,
            "customer_details": {
                "id": null,
                "name": null,
                "email": "gaurav.kumar@gmail.com",
                "contact": "+919000090000",
                "gstin": null,
                "billing_address": null,
                "shipping_address": null,
                "customer_name": null,
                "customer_email": "gaurav.kumar@gmail.com",
                "customer_contact": "+919000090000"
            },
            "order_id": "order_R7XhIkgJKMyD3G",
            "subscription_id": "sub_R7XhHun7FTpu01",
            "line_items": [
                {
                    "id": "li_R7XhIbAv8Wx8BL",
                    "item_id": null,
                    "ref_id": null,
                    "ref_type": null,
                    "name": "elite",
                    "description": "elite plan",
                    "amount": 3000,
                    "unit_amount": 3000,
                    "gross_amount": 9000,
                    "tax_amount": 0,
                    "taxable_amount": 9000,
                    "net_amount": 9000,
                    "currency": "INR",
                    "type": "plan",
                    "tax_inclusive": false,
                    "hsn_code": null,
                    "sac_code": null,
                    "tax_rate": null,
                    "unit": null,
                    "quantity": 3,
                    "taxes": []
                }
            ],
            "payment_id": "pay_R7YIUYs30e6Jzj",
            "status": "paid",
            "expire_by": null,
            "issued_at": 1755682790,
            "paid_at": 1755684922,
            "cancelled_at": null,
            "expired_at": null,
            "sms_status": null,
            "email_status": null,
            "date": 1755682790,
            "terms": null,
            "partial_payment": false,
            "gross_amount": 9000,
            "tax_amount": 0,
            "taxable_amount": 9000,
            "amount": 9000,
            "amount_paid": 9000,
            "amount_due": 0,
            "currency": "INR",
            "currency_symbol": "₹",
            "description": null,
            "notes": [],
            "comment": null,
            "short_url": "https://rzp.io/rzp/IjF4We3P",
            "view_less": true,
            "billing_start": 1755684904,
            "billing_end": 1758306600,
            "type": "invoice",
            "group_taxes_discounts": false,
            "created_at": 1755682790,
            "idempotency_key": null,
            "ref_num": null
        }
    ]
}
POST
Link an Offer to a Subscription
https://api.razorpay.com/v1/subscriptions
You can use this API  link an existing Offer by creating a new Subscription link. Pass the offer_id:  parameter in the request when creating a Subscription.

Authorization
Basic Auth
This request is using an authorization helper from collection Razorpay APIs
Body
raw (text)
View More
text
{
  "plan_id": "plan_00000000000001",
  "total_count": 12,
  "quantity": 1,
  "start_at": 1561852800,
  "expire_by": 1561939199,
  "customer_notify": 1,
  "addons": [
    {
    "item": {
      "name": "Delivery charges",
      "amount": 30000,
      "currency": "INR"
      }
    }
  ],
  "offer_id":"offer_JHD834hjbxzhd38d",
  "notes": {
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  },
  "notify_info":{
    "notify_phone": "+9123456789",
    "notify_email": "gaurav.kumar@example.com"
  }
}
DELETE
Delete an Offer Linked to a Subscription
/subscriptions/{sub_id}/{offer_id}
You can delete an offer linked to a subscription using the Delete an offer linked to a Subscription API.

Authorization
Basic Auth
This request is using an authorization helper from collection Razorpay APIs
Payment Links APIs
Payment Links are URLs that you can send to your customers through SMS and email to collect payments from them. Customers can click on the URL, which opens the payment request page, and complete the payment using any of the available payment methods. You can create, fetch, edit or cancel Payment Links using APIs or from the Dashboard.

List of APIs
﻿Standard Payment Links﻿
﻿Custom Payment Links﻿
﻿Advanced Options﻿
Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
Standard Payment Links
Standard Payment Links are normal, non-customized Payment Links, which are not customized as per your business preferences. Know more about these APIs.

List of APIs
﻿Create a Payment Link﻿
﻿Update a Payment Link﻿
﻿Cancel a Payment Link﻿
﻿Fetch all Payment Links﻿
﻿Fetch a Payment Link﻿
﻿Resend a Payment Link﻿
Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
POST
Create a Standard Payment Link
https://api.razorpay.com/v1/payment_links
You can use this API to create a Payment Link using basic details such as amount, expiry date, reference id, description, customer details and so on.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
View More
json
{
  "amount": 1000,
  "currency": "INR",
  "accept_partial": true,
  "first_min_partial_amount": 100,
  "expire_by": 1791097057,
  "reference_id": "TSsd1990",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "notes": {
    "policy_name": "Jeevan Bima"
  },
  "callback_url": "https://example-callback-url.com/",
  "callback_method": "get"
}
Example
Create a Standard Payment Link
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/payment_links' \
--data-raw '{
  "amount": 1000,
  "currency": "INR",
  "accept_partial": true,
  "first_min_partial_amount": 100,
  "expire_by": 1791097057,
  "reference_id": "TSsd1990",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "notes": {
    "policy_name": "Jeevan Bima"
  },
  "callback_url": "https://example-callback-url.com/",
  "callback_method": "get"
}'
200 OK
Response
Body
Headers (13)
View More
{
    "accept_partial": true,
    "amount": 1000,
    "amount_paid": 0,
    "callback_method": "get",
    "callback_url": "https://example-callback-url.com/",
    "cancelled_at": 0,
    "created_at": 1755695008,
    "currency": "INR",
    "customer": {
        "contact": "+919000090000",
        "email": "gaurav.kumar@example.com",
        "name": "Gaurav Kumar"
    },
    "description": "Payment for policy no #23456",
    "expire_by": 1771592608,
    "expired_at": 0,
    "first_min_partial_amount": 100,
    "id": "plink_R7bAPD5aVBctRt",
    "notes": {
        "policy_name": "Jeevan Bima"
    },
    "notify": {
        "email": true,
        "sms": true,
        "whatsapp": false
    },
    "payments": null,
    "reference_id": "TSsd1990",
    "reminder_enable": true,
    "reminders": [],
    "short_url": "https://rzp.io/rzp/1yi8Kmo",
    "status": "created",
    "updated_at": 1755695008,
    "upi_link": false,
    "user_id": "",
    "whatsapp_link": false
}
PATCH
Update Standard Payment Link
https://api.razorpay.com/v1/payment_links/{plink_id}
You can use this API to edit the Standard Payment Link details such as the reference id, expiry date and so on.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
json
{
    "notes": {
        "policy_name": "Jivan Asha"
    }
}
Example
Update Standard Payment Link
Request
View More
cURL
curl --location --globoff --request PATCH 'https://api.razorpay.com/v1/payment_links/{plink_id}' \
--data '{
    "notes": {
        "policy_name": "Jivan Asha"
    }
}'
200 OK
Response
Body
Headers (12)
View More
{
    "accept_partial": true,
    "amount": 1000,
    "amount_paid": 0,
    "callback_method": "get",
    "callback_url": "https://example-callback-url.com/",
    "cancelled_at": 0,
    "created_at": 1755695008,
    "currency": "INR",
    "customer": {
        "contact": "+919000090000",
        "email": "gaurav.kumar@example.com",
        "name": "Gaurav Kumar"
    },
    "description": "Payment for policy no #23456",
    "expire_by": 1771592608,
    "expired_at": 0,
    "first_min_partial_amount": 100,
    "id": "plink_R7bAPD5aVBctRt",
    "notes": {
        "policy_name": "Jivan Asha"
    },
    "notify": {
        "email": true,
        "sms": true,
        "whatsapp": false
    },
    "payments": [],
    "reference_id": "TSsd1990",
    "reminder_enable": true,
    "reminders": {
        "status": "failed"
    },
    "short_url": "https://rzp.io/rzp/1yi8Kmo",
    "status": "created",
    "updated_at": 1755695337,
    "upi_link": false,
    "user_id": "",
    "whatsapp_link": false
}
POST
Cancel a Standard Payment Link
https://api.razorpay.com/v1/payment_links/{plink_id}/cancel
You can use this API to cancel a Standard Payment Link.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Cancel a Standard Payment Link
Request
View More
cURL
curl --location --globoff --request POST 'https://api.razorpay.com/v1/payment_links/{plink_id}/cancel' \
--header 'Content-Type: application/json' \
--data ''
200 OK
Response
Body
Headers (13)
View More
{
    "accept_partial": true,
    "amount": 1000,
    "amount_paid": 0,
    "callback_method": "get",
    "callback_url": "https://example-callback-url.com/",
    "cancelled_at": 1755695847,
    "created_at": 1755695008,
    "currency": "INR",
    "customer": {
        "contact": "+919000090000",
        "email": "gaurav.kumar@example.com",
        "name": "Gaurav Kumar"
    },
    "description": "Payment for policy no #23456",
    "expire_by": 1771592608,
    "expired_at": 0,
    "first_min_partial_amount": 100,
    "id": "plink_R7bAPD5aVBctRt",
    "notes": {
        "policy_name": "Jivan Asha"
    },
    "notify": {
        "email": true,
        "sms": true,
        "whatsapp": false
    },
    "payments": [],
    "reference_id": "TSsd1990",
    "reminder_enable": true,
    "reminders": {
        "status": "failed"
    },
    "short_url": "https://rzp.io/rzp/1yi8Kmo",
    "status": "cancelled",
    "updated_at": 1755695847,
    "upi_link": false,
    "user_id": "",
    "whatsapp_link": false
}
GET
Fetch All Standard Payment Links
https://api.razorpay.com/v1/payment_links/
You can use this API to retrieve the details of all the Standard Payment Links.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch All Standard Payment Links
Request
cURL
curl --location 'https://api.razorpay.com/v1/payment_links/' \
--header 'Content-Type: application/json' \
--data ''
200 OK
Response
Body
Headers (13)
View More
{
    "payment_links": [
        {
            "accept_partial": true,
            "amount": 1000,
            "amount_paid": 0,
            "callback_method": "get",
            "callback_url": "https://example-callback-url.com/",
            "cancelled_at": 0,
            "created_at": 1755695008,
            "currency": "INR",
            "customer": {
                "contact": "+919000090000",
                "email": "gaurav.kumar@example.com",
                "name": "Gaurav Kumar"
            },
            "description": "Payment for policy no #23456",
            "expire_by": 1771592608,
            "expired_at": 0,
            "first_min_partial_amount": 100,
            "id": "plink_R7bAPD5aVBctRt",
            "notes": {
                "policy_name": "Jivan Asha"
            },
            "notify": {
                "email": true,
                "sms": true,
                "whatsapp": false
            },
            "payments": [],
            "reference_id": "TSsd1990",
            "reminder_enable": true,
            "reminders": {
                "status": "failed"
            },
            "short_url": "https://rzp.io/rzp/1yi8Kmo",
            "status": "created",
            "updated_at": 1755695337,
            "upi_link": false,
            "user_id": "",
            "whatsapp_link": false
        },
        {
            "accept_partial": false,
            "amount": 5100,
            "amount_paid": 5100,
            "cancelled_at": 0,
            "created_at": 1753433638,
            "currency": "INR",
            "customer": [],
            "description": "Test",
            "expire_by": 0,
            "expired_at": 0,
            "first_min_partial_amount": 0,
            "id": "plink_QxF1ieDMVX8f8M",
            "notes": [],
            "notify": {
                "email": true,
                "sms": true,
                "whatsapp": false
            },
            "order_id": "order_QxF1jDWWhrfpz1",
            "payments": [],
            "reference_id": "",
            "reminder_enable": false,
            "reminders": {
                "status": "in_progress"
            },
            "short_url": "https://rzp.io/rzp/zJ1y5trk",
            "status": "paid",
            "updated_at": 1753433728,
            "upi_link": false,
            "user_id": "NjP9KeqtOuDDqg",
            "whatsapp_link": false
        },
        {
            "accept_partial": false,
            "amount": 5000,
            "amount_paid": 5000,
            "cancelled_at": 0,
            "created_at": 1753433324,
            "currency": "INR",
            "customer": [],
            "description": "International test",
            "expire_by": 0,
            "expired_at": 0,
            "first_min_partial_amount": 0,
            "id": "plink_QxEwBe4wecYTKz",
            "notes": [],
            "notify": {
                "email": true,
                "sms": true,
                "whatsapp": false
            },
            "order_id": "order_QxEwCEdQ0i1CCv",
            "payments": [],
            "reference_id": "",
            "reminder_enable": false,
            "reminders": {
                "status": "in_progress"
            },
            "short_url": "https://rzp.io/rzp/251cy78o",
            "status": "paid",
            "updated_at": 1753433419,
            "upi_link": false,
            "user_id": "NjP9KeqtOuDDqg",
            "whatsapp_link": false
        }
    ]
}
POST
Send or Resend Notifications
https://api.razorpay.com/v1/payment_links/{plink_id}/notify_by/:medium
You can use this API to send or resend notifications to your customers via email and SMS.

Authorization
Basic Auth
Username
<username>
Password
<password>
Path Variables
medium
Example
Send or Resend Notifications
Request
View More
cURL
curl --location --globoff --request POST 'https://api.razorpay.com/v1/payment_links/{plink_id}/notify_by/:medium' \
--header 'Content-Type: application/json' \
--data ''
200 OK
Response
Body
Headers (13)
{
    "success": true
}
GET
Fetch Standard Payment Links by Id
https://api.razorpay.com/v1/payment_links/{plink_id}
You can use this API to retrieve the details of a Standard Payment Link using its id.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch Standard Payment Links by Id
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/payment_links/{plink_id}' \
--header 'Content-Type: application/json' \
--data ''
200 OK
Response
Body
Headers (7)
View More
{
    "accept_partial": true,
    "amount": 1000,
    "amount_paid": 0,
    "callback_method": "get",
    "callback_url": "https://example-callback-url.com/",
    "cancelled_at": 0,
    "created_at": 1755695008,
    "currency": "INR",
    "customer": {
        "contact": "+919000090000",
        "email": "gaurav.kumar@example.com",
        "name": "Gaurav Kumar"
    },
    "description": "Payment for policy no #23456",
    "expire_by": 1771592608,
    "expired_at": 0,
    "first_min_partial_amount": 100,
    "id": "plink_R7bAPD5aVBctRt",
    "notes": {
        "policy_name": "Jivan Asha"
    },
    "notify": {
        "email": true,
        "sms": true,
        "whatsapp": false
    },
    "payments": [],
    "reference_id": "TSsd1990",
    "reminder_enable": true,
    "reminders": {
        "status": "failed"
    },
    "short_url": "https://rzp.io/rzp/1yi8Kmo",
    "status": "created",
    "updated_at": 1755695008,
    "upi_link": false,
    "user_id": "",
    "whatsapp_link": false
}
UPI Payment Links
UPI Payment Links are normal, non-customized Payment Links, which are not customized as per your business preferences. Know more about these APIs.

List of APIs
﻿Create a Payment Link﻿
﻿Update a Payment Link﻿
﻿Cancel a Payment Link﻿
﻿Fetch all Payment Links﻿
﻿Fetch a Payment Link﻿
﻿Resend a Payment Link﻿
Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
POST
Create a UPI Payment Link
https://api.razorpay.com/v1/payment_links
You can use this API to to create a UPI Payment Link using basic details such as amount, expiry date, reference id, description, customer details and so on.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
View More
json
{
  "upi_link": "true",
  "amount": 1000,
  "currency": "INR",
  "accept_partial": false,
  "expire_by": 1791097057,
  "reference_id": "TS1999",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "notes": {
    "policy_name": "Jeevan Bima"
  },
  "callback_url": "https://example-callback-url.com/",
  "callback_method": "get"
}
Example
Create a UPI Payment Link
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/payment_links' \
--data-raw '{
  "upi_link": "true",
  "amount": 1000,
  "currency": "INR",
  "accept_partial": false,
  "expire_by": 1791097057,
  "reference_id": "TS1999",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "notes": {
    "policy_name": "Jeevan Bima"
  },
  "callback_url": "https://example-callback-url.com/",
  "callback_method": "get"
}'
200 OK
Response
Body
Headers (13)
View More
{
    "accept_partial": false,
    "amount": 1000,
    "amount_paid": 0,
    "callback_method": "get",
    "callback_url": "https://example-callback-url.com/",
    "cancelled_at": 0,
    "created_at": 1755695191,
    "currency": "INR",
    "customer": {
        "contact": "+919000090000",
        "email": "gaurav.kumar@example.com",
        "name": "Gaurav Kumar"
    },
    "description": "Payment for policy no #23456",
    "expire_by": 1771592791,
    "expired_at": 0,
    "first_min_partial_amount": 0,
    "id": "plink_R7bDdM4YSVItBV",
    "notes": {
        "policy_name": "Jeevan Bima"
    },
    "notify": {
        "email": true,
        "sms": true,
        "whatsapp": false
    },
    "payments": null,
    "reference_id": "TS1999",
    "reminder_enable": true,
    "reminders": [],
    "short_url": "https://rzp.io/rzp/Q6NFBosa",
    "status": "created",
    "updated_at": 1755695191,
    "upi_link": true,
    "user_id": "",
    "whatsapp_link": false
}
PATCH
Update UPI Payment Link
https://api.razorpay.com/v1/payment_links/{plink_id}
You can use this API to edit the UPI Payment Link details, such as the reference id, expiry date and so on.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
json
{
  "reference_id": "TS1996",
  "expire_by": 1771592791,
  "reminder_enable": false,
  "notes": {
    "policy_name": "Jeevan Saral"
  }
}
Example
Update UPI Payment Link
Request
View More
cURL
curl --location --globoff --request PATCH 'https://api.razorpay.com/v1/payment_links/{plink_id}' \
--data '{
  "reference_id": "TS1996",
  "expire_by": 1771592791,
  "reminder_enable": false,
  "notes": {
    "policy_name": "Jeevan Saral"
  }
}'
200 OK
Response
Body
Headers (12)
View More
{
    "accept_partial": false,
    "amount": 1000,
    "amount_paid": 0,
    "callback_method": "get",
    "callback_url": "https://example-callback-url.com/",
    "cancelled_at": 0,
    "created_at": 1755695191,
    "currency": "INR",
    "customer": {
        "contact": "+919000090000",
        "email": "gaurav.kumar@example.com",
        "name": "Gaurav Kumar"
    },
    "description": "Payment for policy no #23456",
    "expire_by": 1771592791,
    "expired_at": 0,
    "first_min_partial_amount": 0,
    "id": "plink_R7bDdM4YSVItBV",
    "notes": {
        "policy_name": "Jeevan Saral"
    },
    "notify": {
        "email": true,
        "sms": true,
        "whatsapp": false
    },
    "payments": [],
    "reference_id": "TS1996",
    "reminder_enable": false,
    "reminders": {
        "status": "failed"
    },
    "short_url": "https://rzp.io/rzp/Q6NFBosa",
    "status": "created",
    "updated_at": 1755696128,
    "upi_link": true,
    "user_id": "",
    "whatsapp_link": false
}
POST
Cancel a UPI Payment Link
https://api.razorpay.com/v1/payment_links/{plink_id}/cancel
You can use this API to cancel a UPI Payment Link.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Cancel a UPI Payment Link
Request
View More
cURL
curl --location --globoff --request POST 'https://api.razorpay.com/v1/payment_links/{plink_id}/cancel' \
--header 'Content-Type: application/json' \
--data ''
200 OK
Response
Body
Headers (13)
View More
{
    "accept_partial": false,
    "amount": 1000,
    "amount_paid": 0,
    "callback_method": "get",
    "callback_url": "https://example-callback-url.com/",
    "cancelled_at": 1755696822,
    "created_at": 1755695191,
    "currency": "INR",
    "customer": {
        "contact": "+919000090000",
        "email": "gaurav.kumar@example.com",
        "name": "Gaurav Kumar"
    },
    "description": "Payment for policy no #23456",
    "expire_by": 1771592791,
    "expired_at": 0,
    "first_min_partial_amount": 0,
    "id": "plink_R7bDdM4YSVItBV",
    "notes": {
        "policy_name": "Jeevan Saral"
    },
    "notify": {
        "email": true,
        "sms": true,
        "whatsapp": false
    },
    "payments": [],
    "reference_id": "TS1996",
    "reminder_enable": false,
    "reminders": {
        "status": "disabled"
    },
    "short_url": "https://rzp.io/rzp/Q6NFBosa",
    "status": "cancelled",
    "updated_at": 1755696822,
    "upi_link": true,
    "user_id": "",
    "whatsapp_link": false
}
GET
Fetch All UPI Payment Links
https://api.razorpay.com/v1/payment_links/
You can use this API to retrieve the details of all the UPI Payment Links.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch All UPI Payment Links
Request
cURL
curl --location 'https://api.razorpay.com/v1/payment_links/' \
--header 'Content-Type: application/json' \
--data ''
200 OK
Response
Body
Headers (13)
View More
{
    "payment_links": [
        {
            "accept_partial": false,
            "amount": 1000,
            "amount_paid": 0,
            "callback_method": "get",
            "callback_url": "https://example-callback-url.com/",
            "cancelled_at": 0,
            "created_at": 1755695191,
            "currency": "INR",
            "customer": {
                "contact": "+919000090000",
                "email": "gaurav.kumar@example.com",
                "name": "Gaurav Kumar"
            },
            "description": "Payment for policy no #23456",
            "expire_by": 1771592791,
            "expired_at": 0,
            "first_min_partial_amount": 0,
            "id": "plink_R7bDdM4YSVItBV",
            "notes": {
                "policy_name": "Jeevan Saral"
            },
            "notify": {
                "email": true,
                "sms": true,
                "whatsapp": false
            },
            "payments": [],
            "reference_id": "TS1996",
            "reminder_enable": false,
            "reminders": {
                "status": "failed"
            },
            "short_url": "https://rzp.io/rzp/Q6NFBosa",
            "status": "created",
            "updated_at": 1755696128,
            "upi_link": true,
            "user_id": "",
            "whatsapp_link": false
        },
        {
            "accept_partial": false,
            "amount": 100,
            "amount_paid": 0,
            "cancelled_at": 0,
            "created_at": 1755595033,
            "currency": "INR",
            "customer": {
                "email": "p.tosh.kumra@gmail.com"
            },
            "customer_id": "cust_R78mGoxkgbI0p9",
            "description": "testing",
            "expire_by": 0,
            "expired_at": 0,
            "first_min_partial_amount": 0,
            "id": "plink_R78mGLGRg5j14X",
            "notes": [],
            "notify": {
                "email": true,
                "sms": true,
                "whatsapp": false
            },
            "order_id": "order_R78mHizqjMGv4t",
            "payments": null,
            "reference_id": "",
            "reminder_enable": false,
            "reminders": [],
            "short_url": "https://rzp.io/rzp/MjiMGIPx",
            "status": "created",
            "updated_at": 1755595033,
            "upi_link": false,
            "user_id": "PVP68IyHn36N8K",
            "whatsapp_link": false
        },
        {
            "accept_partial": false,
            "amount": 100,
            "amount_paid": 0,
            "cancelled_at": 0,
            "created_at": 1753900077,
            "currency": "INR",
            "customer": {
                "email": "goshashwat@gmail.com"
            },
            "customer_id": "cust_QzNTd3VHrGkt7g",
            "description": "asda",
            "expire_by": 0,
            "expired_at": 0,
            "first_min_partial_amount": 0,
            "id": "plink_QzNTcfxtIdiChh",
            "notes": [],
            "notify": {
                "email": true,
                "sms": true,
                "whatsapp": false
            },
            "order_id": "order_QzNTdlk6Xda28N",
            "payments": null,
            "reference_id": "",
            "reminder_enable": true,
            "reminders": [],
            "short_url": "https://rzp.io/rzp/IYB7ulp",
            "status": "created",
            "updated_at": 1753900077,
            "upi_link": false,
            "user_id": "F1dskeByGhI6Xn",
            "whatsapp_link": false
        }
    ]
}
GET
Fetch UPI Payment Links With ID
https://api.razorpay.com/v1/payment_links/{plink_id}
You can use this API to retrieve the details of a UPI Payment Link using its id.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch UPI Payment Link With ID
Request
View More
cURL
curl --location --globoff 'https://api.razorpay.com/v1/payment_links/{plink_id}' \
--header 'Content-Type: application/json' \
--data ''
200 OK
Response
Body
Headers (7)
View More
{
    "accept_partial": false,
    "amount": 1000,
    "amount_paid": 0,
    "callback_method": "get",
    "callback_url": "https://example-callback-url.com/",
    "cancelled_at": 0,
    "created_at": 1755695191,
    "currency": "INR",
    "customer": {
        "contact": "+919000090000",
        "email": "gaurav.kumar@example.com",
        "name": "Gaurav Kumar"
    },
    "description": "Payment for policy no #23456",
    "expire_by": 1771592791,
    "expired_at": 0,
    "first_min_partial_amount": 0,
    "id": "plink_R7bDdM4YSVItBV",
    "notes": {
        "policy_name": "Jeevan Saral"
    },
    "notify": {
        "email": true,
        "sms": true,
        "whatsapp": false
    },
    "payments": [],
    "reference_id": "TS1996",
    "reminder_enable": false,
    "reminders": {
        "status": "disabled"
    },
    "short_url": "https://rzp.io/rzp/Q6NFBosa",
    "status": "created",
    "updated_at": 1755695191,
    "upi_link": true,
    "user_id": "",
    "whatsapp_link": false
}
Custom Payment Links
You can send standard payment links to customers via email and SMS. When customers click on the payment link, they are redirected to a page hosted by us where they can complete the payment.

The payment request page consists of two sections:

Payment Details: Displays details about the payment description, expiry date, payable amount and in case of partial payments, partial amount paid and due.
Checkout: Displays the Phone and Email fields and list the various payment methods available.
You can customize this hosted page as per your brand and business requirements. For example, you may display only specific payment methods, change the colour of Checkout, and so on.

Know more about - Custom Payment Links.

List of APIs
﻿Implement Thematic Changes in Payment Links Checkout Section﻿
﻿Change Business Name﻿
﻿Customize Payment Methods﻿
﻿Prefill Checkout Fields﻿
﻿Set Checkout Fields as Read-Only﻿
﻿Rename Labels in Checkout Section﻿
﻿Rename Labels in Payment Details Section﻿
Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
POST
Implement Thematic Changes in Payment Links Checkout Section
https://api.razorpay.com/v1/payment_links
You can use this API to modify the top bar theme element of the Checkout UI on the payment request page.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
View More
json
{
  "amount": 1000,
  "currency": "INR",
  "accept_partial": true,
  "first_min_partial_amount": 100,
  "reference_id": "#423213",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "options": {
    "checkout": {
      "theme": {
        "hide_topbar": true
      }
    }
  }
}
Example
Implement Thematic Changes in Payment Links Checkout Section
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/payment_links' \
--data-raw '{
  "amount": 1000,
  "currency": "INR",
  "accept_partial": true,
  "first_min_partial_amount": 100,
  "reference_id": "#423213",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "options": {
    "checkout": {
      "theme": {
        "hide_topbar": true
      }
    }
  }
}'
200 OK
Response
Body
Headers (13)
View More
{
    "accept_partial": true,
    "amount": 1000,
    "amount_paid": 0,
    "cancelled_at": 0,
    "created_at": 1755697302,
    "currency": "INR",
    "customer": {
        "contact": "+919000090000",
        "email": "gaurav.kumar@example.com",
        "name": "Gaurav Kumar"
    },
    "description": "Payment for policy no #23456",
    "expire_by": 0,
    "expired_at": 0,
    "first_min_partial_amount": 100,
    "id": "plink_R7bomTsdegch8X",
    "notes": null,
    "notify": {
        "email": true,
        "sms": true,
        "whatsapp": false
    },
    "options": {
        "checkout": {
            "name": ""
        }
    },
    "payments": null,
    "reference_id": "#423213",
    "reminder_enable": true,
    "reminders": [],
    "short_url": "https://rzp.io/rzp/AOWwTFm",
    "status": "created",
    "updated_at": 1755697302,
    "upi_link": false,
    "user_id": "",
    "whatsapp_link": false
}
POST
Change Business Name
https://api.razorpay.com/v1/payment_links
You can use this API to change the business name that appears on the Checkout section of the Payment Link's payment request page.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
View More
json
{
  "amount": 1000,
  "currency": "INR",
  "accept_partial": true,
  "first_min_partial_amount": 100,
  "reference_id": "#2234543",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "options": {
    "checkout": {
      "name": "Lacme Corp"
    }
  }
}
Example
Change Business Name
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/payment_links' \
--data-raw '{
  "amount": 1000,
  "currency": "INR",
  "accept_partial": true,
  "first_min_partial_amount": 100,
  "reference_id": "#2234543",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "options": {
    "checkout": {
      "name": "Lacme Corp"
    }
  }
}'
200 OK
Response
Body
Headers (13)
View More
{
    "accept_partial": true,
    "amount": 1000,
    "amount_paid": 0,
    "cancelled_at": 0,
    "created_at": 1755697431,
    "currency": "INR",
    "customer": {
        "contact": "+919000090000",
        "email": "gaurav.kumar@example.com",
        "name": "Gaurav Kumar"
    },
    "description": "Payment for policy no #23456",
    "expire_by": 0,
    "expired_at": 0,
    "first_min_partial_amount": 100,
    "id": "plink_R7br46FNkfFbhK",
    "notes": null,
    "notify": {
        "email": true,
        "sms": true,
        "whatsapp": false
    },
    "options": {
        "checkout": {
            "name": "Lacme Corp"
        }
    },
    "payments": null,
    "reference_id": "#2234543",
    "reminder_enable": true,
    "reminders": [],
    "short_url": "https://rzp.io/rzp/b1Jp1Av",
    "status": "created",
    "updated_at": 1755697431,
    "upi_link": false,
    "user_id": "",
    "whatsapp_link": false
}
POST
Customise Payment Methods - Options and Method Parameters
https://api.razorpay.com/v1/payment_links/
You can use this API to  enable or disable display of specific payment methods.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
View More
json

{
  "amount": 1000,
  "currency": "INR",
  "accept_partial": true,
  "first_min_partial_amount": 1000,
  "reference_id": "#523442",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "options": {
    "checkout": {
      "method": {
        "netbanking": true,
        "card": true,
        "upi": false,
        "wallet": false
      }
    }
  }
}
Example
Customise Payment Methods - Options and Method Parameters
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/payment_links/' \
--data-raw '
{
  "amount": 1000,
  "currency": "INR",
  "accept_partial": true,
  "first_min_partial_amount": 1000,
  "reference_id": "#523442",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "options": {
    "checkout": {
      "method": {
        "netbanking": true,
        "card": true,
        "upi": false,
        "wallet": false
      }
    }
  }
}'
200 OK
Response
Body
Headers (13)
View More
{
    "accept_partial": true,
    "amount": 1000,
    "amount_paid": 0,
    "cancelled_at": 0,
    "created_at": 1755697701,
    "currency": "INR",
    "customer": {
        "contact": "+919000090000",
        "email": "gaurav.kumar@example.com",
        "name": "Gaurav Kumar"
    },
    "description": "Payment for policy no #23456",
    "expire_by": 0,
    "expired_at": 0,
    "first_min_partial_amount": 1000,
    "id": "plink_R7bvo0lTVRG54I",
    "notes": null,
    "notify": {
        "email": true,
        "sms": true,
        "whatsapp": false
    },
    "options": {
        "checkout": {
            "name": ""
        }
    },
    "payments": null,
    "reference_id": "#523442",
    "reminder_enable": true,
    "reminders": [],
    "short_url": "https://rzp.io/rzp/9Yip0z6",
    "status": "created",
    "updated_at": 1755697701,
    "upi_link": false,
    "user_id": "",
    "whatsapp_link": false
}
POST
Prefill Checkout Fields
https://api.razorpay.com/v1/payment_links/
Learn how to prefill payment methods, bank names and partial payment-related fields.

Authorization
Basic Auth
This request is using an authorization helper from collection Razorpay APIs
Body
raw (json)
View More
json
{
  "amount": 1000,
  "currency": "INR",
  "accept_partial": true,
  "first_min_partial_amount": 100,
  "reference_id": "#419",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "options": {
    "checkout": {
      "prefill": {
        "select_partial": true
      }
    }
  }
}
POST
Set Checkout Fields as Read-Only
https://api.razorpay.com/v1/payment_links/
Learn how to customize and set the email and contact fields in the Checkout Section of the Payment Links payment request page using Razorpay API.

Authorization
Basic Auth
This request is using an authorization helper from collection Razorpay APIs
Body
raw (json)
View More
json
{
  "amount": 1000,
  "currency": "INR",
  "accept_partial": true,
  "first_min_partial_amount": 100,
  "reference_id": "#20",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "options": {
    "checkout": {
      "readonly": {
        "email": true,
        "contact": true
      }
    }
  }
}
POST
Rename Labels in Checkout Section
https://api.razorpay.com/v1/payment_links/
You can use this API to change the labels for the fields related to partial payments.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
View More
json
{
  "amount": 1000,
  "currency": "INR",
  "accept_partial": true,
  "first_min_partial_amount": 100,
  "reference_id": "#421",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "options": {
    "checkout": {
      "partial_payment": {
        "min_amount_label": "Minimum Money to be paid",
        "partial_amount_label": "Pay in parts",
        "partial_amount_description": "Pay at least ₹100",
        "full_amount_label": "Pay the entire amount"
      }
    }
  }
}
Example
Rename Labels in Checkout Section
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/payment_links/' \
--data-raw '{
  "amount": 1000,
  "currency": "INR",
  "accept_partial": true,
  "first_min_partial_amount": 100,
  "reference_id": "#421",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "options": {
    "checkout": {
      "partial_payment": {
        "min_amount_label": "Minimum Money to be paid",
        "partial_amount_label": "Pay in parts",
        "partial_amount_description": "Pay at least ₹100",
        "full_amount_label": "Pay the entire amount"
      }
    }
  }
}'
200 OK
Response
Body
Headers (13)
View More
{
    "accept_partial": true,
    "amount": 1000,
    "amount_paid": 0,
    "cancelled_at": 0,
    "created_at": 1755699898,
    "currency": "INR",
    "customer": {
        "contact": "+919000090000",
        "email": "gaurav.kumar@example.com",
        "name": "Gaurav Kumar"
    },
    "description": "Payment for policy no #23456",
    "expire_by": 0,
    "expired_at": 0,
    "first_min_partial_amount": 100,
    "id": "plink_R7cYULjvKwzBcD",
    "notes": null,
    "notify": {
        "email": true,
        "sms": true,
        "whatsapp": false
    },
    "options": {
        "checkout": {
            "name": ""
        }
    },
    "payments": null,
    "reference_id": "#421",
    "reminder_enable": true,
    "reminders": [],
    "short_url": "https://rzp.io/rzp/d7UXkOo",
    "status": "created",
    "updated_at": 1755699898,
    "upi_link": false,
    "user_id": "",
    "whatsapp_link": false
}
POST
Rename Labels in Payment Details Section
https://api.razorpay.com/v1/payment_links/
You can use this API to change the labels for fields on the Payment Details section of the Payment Link's payment request page.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
View More
json
{
  "amount": 1000,
  "currency": "INR",
  "accept_partial": true,
  "first_min_partial_amount": 100,
  "reference_id": "#412232",
  "description": "Payment for policy no #23456",
  "expire_by": 1799193801,
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "options": {
    "hosted_page": {
      "label": {
        "receipt": "Ref No.",
        "description": "Course Name",
        "amount_payable": "Course Fee Payable",
        "amount_paid": "Course Fee Paid",
        "partial_amount_due": "Fee Installment Due",
        "partial_amount_paid": "Fee Installment Paid",
        "expire_by": "Pay Before",
        "expired_on": "Link Expired. Please contact Admin",
        "amount_due": "Course Fee Due"
      },
      "show_preferences": {
        "issued_to": false
      }
    }
  }
}
Example
Rename Labels in Payment Details Section
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/payment_links/' \
--data-raw '{
  "amount": 1000,
  "currency": "INR",
  "accept_partial": true,
  "first_min_partial_amount": 100,
  "reference_id": "#412232",
  "description": "Payment for policy no #23456",
  "expire_by": 1799193801,
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "options": {
    "hosted_page": {
      "label": {
        "receipt": "Ref No.",
        "description": "Course Name",
        "amount_payable": "Course Fee Payable",
        "amount_paid": "Course Fee Paid",
        "partial_amount_due": "Fee Installment Due",
        "partial_amount_paid": "Fee Installment Paid",
        "expire_by": "Pay Before",
        "expired_on": "Link Expired. Please contact Admin",
        "amount_due": "Course Fee Due"
      },
      "show_preferences": {
        "issued_to": false
      }
    }
  }
}'
200 OK
Response
Body
Headers (13)
View More
{
    "accept_partial": true,
    "amount": 1000,
    "amount_paid": 0,
    "cancelled_at": 0,
    "created_at": 1755700076,
    "currency": "INR",
    "customer": {
        "contact": "+919000090000",
        "email": "gaurav.kumar@example.com",
        "name": "Gaurav Kumar"
    },
    "description": "Payment for policy no #23456",
    "expire_by": 1771597675,
    "expired_at": 0,
    "first_min_partial_amount": 100,
    "id": "plink_R7cbccEeCTJx0I",
    "notes": null,
    "notify": {
        "email": true,
        "sms": true,
        "whatsapp": false
    },
    "options": [],
    "payments": null,
    "reference_id": "#412232",
    "reminder_enable": true,
    "reminders": [],
    "short_url": "https://rzp.io/rzp/tdGizCl5",
    "status": "created",
    "updated_at": 1755700076,
    "upi_link": false,
    "user_id": "",
    "whatsapp_link": false
}
POST
Rename Labels in Payment Details Section - Hindi
https://api.razorpay.com/v1/payment_links/
You can use this API to change the labels for fields on the Payment Details section of the Payment Link's payment request page.

You may even display labels in a different language for example, Hindi or Tamil.
Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
View More
json
{
  "amount": 1000,
  "currency": "INR",
  "accept_partial": true,
  "first_min_partial_amount": 100,
  "reference_id": "#423",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "options":{
    "hosted_page":{
      "label":{
        "receipt":"रसीद संख्या",
        "description":"कोर्स का नाम",
        "amount_payable":"शुल्क भुगतान",
        "amount_paid":"शुल्क जमा ",
        "partial_amount_due":"बाकी शुल्क किस्त",
        "partial_amount_paid":"शुल्क किस्त जमा",
        "expire_by":"शुल्क पेमेंट लास्ट डेट",
        "expired_on":"लिंक की समय सीमा समाप्त हो गई है। कृपया व्यवस्थापक से संपर्क करें",
        "amount_due": "बाकी शुल्क "
      },
      "show_preferences":{
        "issued_to":false
      }
    }
  }
}
Example
Rename Labels in Payment Details Section - Hindi
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/payment_links/' \
--data-raw '{
  "amount": 1000,
  "currency": "INR",
  "accept_partial": true,
  "first_min_partial_amount": 100,
  "reference_id": "#423",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "options":{
    "hosted_page":{
      "label":{
        "receipt":"रसीद संख्या",
        "description":"कोर्स का नाम",
        "amount_payable":"शुल्क भुगतान",
        "amount_paid":"शुल्क जमा ",
        "partial_amount_due":"बाकी शुल्क किस्त",
        "partial_amount_paid":"शुल्क किस्त जमा",
        "expire_by":"शुल्क पेमेंट लास्ट डेट",
        "expired_on":"लिंक की समय सीमा समाप्त हो गई है। कृपया व्यवस्थापक से संपर्क करें",
        "amount_due": "बाकी शुल्क "
      },
      "show_preferences":{
        "issued_to":false
      }
    }
  }
}'
200 OK
Response
Body
Headers (13)
View More
{
    "accept_partial": true,
    "amount": 1000,
    "amount_paid": 0,
    "cancelled_at": 0,
    "created_at": 1755700280,
    "currency": "INR",
    "customer": {
        "contact": "+919000090000",
        "email": "gaurav.kumar@example.com",
        "name": "Gaurav Kumar"
    },
    "description": "Payment for policy no #23456",
    "expire_by": 0,
    "expired_at": 0,
    "first_min_partial_amount": 100,
    "id": "plink_R7cfD60BRsux3g",
    "notes": null,
    "notify": {
        "email": true,
        "sms": true,
        "whatsapp": false
    },
    "options": [],
    "payments": null,
    "reference_id": "#423",
    "reminder_enable": true,
    "reminders": [],
    "short_url": "https://rzp.io/rzp/K5cqL1yN",
    "status": "created",
    "updated_at": 1755700280,
    "upi_link": false,
    "user_id": "",
    "whatsapp_link": false
}
Advanced Options
You can perform advanced configuration on Payment Links to help achieve your business requirements:

You can set up Payment Links so that payments made against the link are automatically transferred to a linked account. This saves you the additional step of making a Transfer API call later.
To attract and retain customers, you can provide promotional offers on Payment Links such as discounts and cashback. Customers can avail these offers while making payments using Payment Links.
You can use Razorpay Payment Links to perform third-party validation of bank accounts provided by your customers.
List of APIs
﻿Transfer Payments Received Using Payment Links﻿
﻿Offers on Payment Links﻿
﻿Third-party Validation on Payment Links﻿
Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
Perform Third-Party Validation Using Payment Links
Third-party validation is a process using which you can ensure that customers make payments using only those bank accounts that they had provided at the time of registration.

Know more about third-party validation using  Payment Links API.

Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
POST
Netbanking
https://api.razorpay.com/v1/payment_links/
You can use this API to comply with the regulatory guidelines in a manner such that the customers make payments only from their registered bank account.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
View More
json
{
  "amount": 1000,
  "currency": "INR",
  "accept_partial": true,
  "first_min_partial_amount": 100,
  "reference_id": "#4sds25",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "options": {
    "order": {
      "method": "netbanking",
      "bank_account": {
        "account_number": "04300040049999",
        "name": "Gaurav Kumar",
        "ifsc": "KKBK0000430"
      }
    }
  }
}
Example
Netbanking
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/payment_links/' \
--data-raw '{
  "amount": 1000,
  "currency": "INR",
  "accept_partial": true,
  "first_min_partial_amount": 100,
  "reference_id": "#4sds25",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "options": {
    "order": {
      "method": "netbanking",
      "bank_account": {
        "account_number": "04300040049999",
        "name": "Gaurav Kumar",
        "ifsc": "KKBK0000430"
      }
    }
  }
}'
200 OK
Response
Body
Headers (13)
View More
{
    "accept_partial": true,
    "amount": 1000,
    "amount_paid": 0,
    "cancelled_at": 0,
    "created_at": 1755701793,
    "currency": "INR",
    "customer": {
        "contact": "+919000090000",
        "email": "gaurav.kumar@example.com",
        "name": "Gaurav Kumar"
    },
    "description": "Payment for policy no #23456",
    "expire_by": 0,
    "expired_at": 0,
    "first_min_partial_amount": 100,
    "id": "plink_R7d5rXPpHz1xOu",
    "notes": null,
    "notify": {
        "email": true,
        "sms": true,
        "whatsapp": false
    },
    "options": [],
    "payments": null,
    "reference_id": "#4sds25",
    "reminder_enable": true,
    "reminders": [],
    "short_url": "https://rzp.io/rzp/VZsqCEN",
    "status": "created",
    "updated_at": 1755701793,
    "upi_link": false,
    "user_id": "",
    "whatsapp_link": false
}
POST
UPI
https://api.razorpay.com/v1/payment_links/
You can use this API to comply with the regulatory guidelines in a manner such that the customers make payments only from their registered bank account.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
View More
json
{
  "amount": 1000,
  "currency": "INR",
  "accept_partial": true,
  "first_min_partial_amount": 100,
  "reference_id": "#42226",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "options": {
    "order": {
      "method": "upi",
      "bank_account": {
        "account_number": "04300040049999",
        "name": "Gaurav Kumar",
        "ifsc": "KKBK0000430"
      }
    }
  }
}
Example
UPI
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/payment_links/' \
--data-raw '{
  "amount": 1000,
  "currency": "INR",
  "accept_partial": true,
  "first_min_partial_amount": 100,
  "reference_id": "#42226",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "options": {
    "order": {
      "method": "upi",
      "bank_account": {
        "account_number": "04300040049999",
        "name": "Gaurav Kumar",
        "ifsc": "KKBK0000430"
      }
    }
  }
}'
200 OK
Response
Body
Headers (13)
View More
{
    "accept_partial": true,
    "amount": 1000,
    "amount_paid": 0,
    "cancelled_at": 0,
    "created_at": 1755701893,
    "currency": "INR",
    "customer": {
        "contact": "+919000090000",
        "email": "gaurav.kumar@example.com",
        "name": "Gaurav Kumar"
    },
    "description": "Payment for policy no #23456",
    "expire_by": 0,
    "expired_at": 0,
    "first_min_partial_amount": 100,
    "id": "plink_R7d7cNA6EUP3vL",
    "notes": null,
    "notify": {
        "email": true,
        "sms": true,
        "whatsapp": false
    },
    "options": [],
    "payments": null,
    "reference_id": "#42226",
    "reminder_enable": true,
    "reminders": [],
    "short_url": "https://rzp.io/rzp/C0OZRAEr",
    "status": "created",
    "updated_at": 1755701893,
    "upi_link": false,
    "user_id": "",
    "whatsapp_link": false
}
POST
Either
https://api.razorpay.com/v1/payment_links/
You can use this API to comply with the regulatory guidelines in a manner such that the customers make payments only from their registered bank account.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
View More
json
{
  "amount": 1000,
  "currency": "INR",
  "accept_partial": true,
  "first_min_partial_amount": 100,
  "reference_id": "#qw427",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "options": {
    "order": {
      "bank_account": {
        "account_number": "04300050077634",
        "name": "Gaurav Kumar",
        "ifsc": "KKBK0000430"
      }
    }
  }
}
Example
Either
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/payment_links/' \
--data-raw '{
  "amount": 1000,
  "currency": "INR",
  "accept_partial": true,
  "first_min_partial_amount": 100,
  "reference_id": "#qw427",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "options": {
    "order": {
      "bank_account": {
        "account_number": "04300050077634",
        "name": "Gaurav Kumar",
        "ifsc": "KKBK0000430"
      }
    }
  }
}'
200 OK
Response
Body
Headers (13)
View More
{
    "accept_partial": true,
    "amount": 1000,
    "amount_paid": 0,
    "cancelled_at": 0,
    "created_at": 1755701956,
    "currency": "INR",
    "customer": {
        "contact": "+919000090000",
        "email": "gaurav.kumar@example.com",
        "name": "Gaurav Kumar"
    },
    "description": "Payment for policy no #23456",
    "expire_by": 0,
    "expired_at": 0,
    "first_min_partial_amount": 100,
    "id": "plink_R7d8iY5U53lcDd",
    "notes": null,
    "notify": {
        "email": true,
        "sms": true,
        "whatsapp": false
    },
    "options": [],
    "payments": null,
    "reference_id": "#qw427",
    "reminder_enable": true,
    "reminders": [],
    "short_url": "https://rzp.io/rzp/G1EG5WO3",
    "status": "created",
    "updated_at": 1755701956,
    "upi_link": false,
    "user_id": "",
    "whatsapp_link": false
}
POST
Transfer Payments Received Using Payment Links
https://api.razorpay.com/v1/payment_links/
You can use this API to transfer the payments received from your customers automatically to your linked accounts.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
View More
json
{
  "amount": 1500,
  "currency": "INR",
  "accept_partial": false,
  "reference_id": "#aasasw8",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "options": {
    "order": {
      "transfers": [
        {
          "account": "acc_CPRsN1LkFccllA",
          "amount": 500,
          "currency": "INR",
          "notes": {
            "branch": "Acme Corp Bangalore North",
            "name": "Bhairav Kumar"
          },
          "linked_account_notes": [
            "branch"
          ]
        },
        {
          "account": "acc_CNo3jSI8OkFJJJ",
          "amount": 500,
          "currency": "INR",
          "notes": {
            "branch": "Acme Corp Bangalore South",
            "name": "Saurav Kumar"
          },
          "linked_account_notes": [
            "branch"
          ]
        }
      ]
    }
  }
}
Example
Transfer Payments Received Using Payment Links
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/payment_links/' \
--data-raw '{
  "amount": 1500,
  "currency": "INR",
  "accept_partial": false,
  "reference_id": "#aasasw8",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "options": {
    "order": {
      "transfers": [
        {
          "account": "acc_CPRsN1LkFccllA",
          "amount": 500,
          "currency": "INR",
          "notes": {
            "branch": "Acme Corp Bangalore North",
            "name": "Bhairav Kumar"
          },
          "linked_account_notes": [
            "branch"
          ]
        },
        {
          "account": "acc_CNo3jSI8OkFJJJ",
          "amount": 500,
          "currency": "INR",
          "notes": {
            "branch": "Acme Corp Bangalore South",
            "name": "Saurav Kumar"
          },
          "linked_account_notes": [
            "branch"
          ]
        }
      ]
    }
  }
}'
200 OK
Response
Body
Headers (13)
View More
{
    "accept_partial": false,
    "amount": 1500,
    "amount_paid": 0,
    "cancelled_at": 0,
    "created_at": 1755702183,
    "currency": "INR",
    "customer": {
        "contact": "+919000090000",
        "email": "gaurav.kumar@example.com",
        "name": "Gaurav Kumar"
    },
    "description": "Payment for policy no #23456",
    "expire_by": 0,
    "expired_at": 0,
    "first_min_partial_amount": 0,
    "id": "plink_R7dCik5zlMftla",
    "notes": null,
    "notify": {
        "email": true,
        "sms": true,
        "whatsapp": false
    },
    "options": [],
    "payments": null,
    "reference_id": "#aasasw8",
    "reminder_enable": true,
    "reminders": [],
    "short_url": "https://rzp.io/rzp/FR37w6I",
    "status": "created",
    "updated_at": 1755702183,
    "upi_link": false,
    "user_id": "",
    "whatsapp_link": false
}
POST
Offers on Payment Links
https://api.razorpay.com/v1/payment_links
Using Razorpay Offers, you can provide discounts or cashback on Payment Links issued to customers. You can restrict the payment methods on which the Offers are applied and limit their usage to a defined time period.

Know more about this API.

Authorization
Basic Auth
This request is using an authorization helper from collection Razorpay APIs
Body
raw (json)
View More
json
{
  "amount": 3400,
  "currency": "INR",
  "accept_partial": false,
  "reference_id": "#425",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": false,
  "options": {
    "order": {
      "offers": [
        "offer_F4WMTC3pwFKnzq",
        "offer_F4WJHqvGzw8dWF"
      ]
    }
  }
}
POST
Offers on Payment Links
https://api.razorpay.com/v1/payment_links
You can use this API to provide offers on Payment Links. Razorpay Offers provides discounts or cashback on Payment Links issued to customers.

Authorization
Basic Auth
This request is using an authorization helper from collection Razorpay APIs
Body
raw (json)
View More
json
{
  "amount": 3400,
  "currency": "INR",
  "accept_partial": false,
  "reference_id": "#425",
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": false,
  "options": {
    "order": {
      "offers": [
        "offer_F4WMTC3pwFKnzq",
        "offer_F4WJHqvGzw8dWF"
      ]
    }
  }
}
Smart Collect
You can create Customer Identifiers using the Smart Collect APIs to accept large payments from your customers in the form of bank transfers via NEFT, RTGS and IMPS.

If you are a new customer, explore Smart Collect 2.0  which is an upgraded version of Smart Collect. It uses the same APIs as Smart Collect, while also offering additional endpoints—such as creating a Customer Identifier with a VPA and bank account, fetching UPI payments, and adding a VPA Receiver to an existing Customer Identifier.

List of APIs
﻿Smart Collect 2.0﻿
﻿Smart Collect﻿
﻿Smart Collect-TPV﻿
Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
Smart Collect 2.0
Smart Collect 2.0, which is an upgraded version of Smart Collect, offers additional APIs which enables you to create Customer Identifiers with Bank Account and VPA Receiver, add VPA Receiver to existing Customer Identifier, and fetch payments made using UPI.

Open a Current account or an Escrow account to start using Smart Collect 2.0.﻿

List of APIs
﻿Create a Customer Identifier With VPA and Bank Account Receivers﻿
﻿Add VPA Receiver to an Existing Customer Identifier (Smart Collect 2.0)﻿
﻿Fetch Payments Made Using UPI (Smart Collect 2.0)﻿
Smart Collect 2.0 offers all the existing functionalities of Smart Collect and uses the same Smart Collect API endpoints, in addition to the new APIs listed on this page.
Use Smart Collect TPV APIs to Add an Allowed Payer or Delete an Allowed Payer.
Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
POST
Create a Customer Identifier With VPA and Bank Account Receivers (Smart Collect 2.0)
https://api.razorpay.com/v1/virtual_accounts
You can use this API  to create a Customer Identifier with both bank_account and vpa receiver types.

You can customise the merchant prefix of the vpa (payto00000) as per your business requirements. This is an on-demand feature and is not available by default. To enable creation of custom merchant prefix, raise a request on our Support Portal.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
View More
json
{
  "receivers": {
    "types": [
      "vpa",
      "bank_account"
    ]
  },
  "description": "Receive payment instalment from Gaurav Kumar- Flat No 105",
  "customer_id": "cust_R4M5FoBMpUCJgQ",
  "close_by": 1754988735
}
Example
Create a Customer Identifier With VPA and Bank Account Receivers (Smart Collect 2.0)
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/virtual_accounts' \
--data '{
  "receivers": {
    "types": [
      "vpa",
      "bank_account"
    ]
  },
  "description": "Receive payment instalment from Gaurav Kumar- Flat No 105",
  "customer_id": "cust_R4M5FoBMpUCJgQ",
  "close_by": 1754988735
}'
200 OK
Response
Body
Headers (13)
View More
Text
{
    "id": "va_R4M6WZWgaGOpDb",
    "name": "Bertie Botts",
    "entity": "virtual_account",
    "status": "active",
    "description": "Receive payment instalment from Gaurav Kumar- Flat No 105",
    "amount_expected": null,
    "notes": [],
    "amount_paid": 0,
    "customer_id": "cust_R4M5FoBMpUCJgQ",
    "receivers": [
        {
            "id": "ba_R4M6WvSJ7efwbv",
            "entity": "bank_account",
            "ifsc": "RAZR0000001",
            "bank_name": null,
            "name": "Bertie Botts",
            "notes": [],
            "account_number": "1112220000211111"
        },
        {
            "id": "vpa_R4M6Wgc0jORK5B",
            "entity": "vpa",
            "username": "rzr.payto000001201968910",
            "handle": "icic",
            "address": "rzr.payto000001201968910@icic"
        }
    ],
    "close_by": 1754988735,
    "closed_at": null,
    "created_at": 1754986943
}
POST
Add VPA Receiver to an Existing Customer Identifier (Smart Collect 2.0)
https://api.razorpay.com/v1/virtual_accounts/va_R4MBVN1TawpJ1T/receivers
You can use this API to add a VPA receiver to an existing Customer Identifier. If you have created a Customer Identifier with only a VPA receiver, you cannot replace or update it using this endpoint.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
json
{
  "types": [
    "vpa"
  ],
  "vpa": {}
}
Example
Add VPA Receiver to an Existing Customer Identifier (Smart Collect 2.0)
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/virtual_accounts/va_R4MBVN1TawpJ1T/receivers' \
--data '{
  "types": [
    "vpa"
  ],
  "vpa": {}
}'
200 OK
Response
Body
Headers (13)
View More
Text
{
    "id": "va_R4MBVN1TawpJ1T",
    "name": "Bertie Botts",
    "entity": "virtual_account",
    "status": "active",
    "description": "Receive payment instalment from Gaurav Kumar- Flat No 105",
    "amount_expected": null,
    "notes": [],
    "amount_paid": 0,
    "customer_id": "cust_R4M5FoBMpUCJgQ",
    "receivers": [
        {
            "id": "ba_R4MBVbzSBqeutM",
            "entity": "bank_account",
            "ifsc": "RAZR0000001",
            "bank_name": null,
            "name": "Bertie Botts",
            "notes": [],
            "account_number": "1112220092941111"
        },
        {
            "id": "vpa_R4MBrVtAEd2hKD",
            "entity": "vpa",
            "username": "rzr.payto000004388177337",
            "handle": "icic",
            "address": "rzr.payto000004388177337@icic"
        }
    ],
    "close_by": 1754988735,
    "closed_at": null,
    "created_at": 1754987226
}
GET
Fetch Payments Made Using UPI (Smart Collect 2.0)
https://api.razorpay.com/v1/payments/pay_JGmL38CqCHTyZZ/upi_transfer
You can use this API to retrieve details of payments made using the UPI payment method.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch Payments Made Using UPI (Smart Collect 2.0)
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/payments/pay_JGmL38CqCHTyZZ/upi_transfer'
200 OK
Response
Body
Headers (13)
View More
Text
{
    "id": "ut_JGmL4ZgAUU8drv",
    "entity": "upi_transfer",
    "amount": 1000,
    "payer_vpa": "gaurav.kumar@okhdfcbank",
    "payer_bank": null,
    "payer_account": null,
    "payer_ifsc": "",
    "payment_id": "pay_JGmL38CqCHTyZZ",
    "rrn": "209817848101",
    "virtual_account_id": "va_HWj6a2eLyUQD9y",
    "virtual_account": {
        "id": "va_HWj6a2eLyUQD9y",
        "name": "Bertie Botts",
        "entity": "virtual_account",
        "status": "closed",
        "description": null,
        "amount_expected": null,
        "notes": [],
        "amount_paid": 1000,
        "customer_id": "cust_HWj3MjySAHSjtq",
        "receivers": [
            {
                "id": "ba_HWj6aE5ARi5sTU",
                "entity": "bank_account",
                "ifsc": "RATN0VAAPIS",
                "bank_name": "RBL Bank",
                "name": "Bertie Botts",
                "notes": [],
                "account_number": "2223330005151111"
            },
            {
                "id": "vpa_HWj6aGW3nGmT2y",
                "entity": "vpa",
                "username": "rpy.acmestar1234567",
                "handle": "icici",
                "address": "rpy.acmestar1234567@icici"
            }
        ],
        "close_by": null,
        "closed_at": 1676723423,
        "created_at": 1625810601
    }
}
Smart Collect
You can create Customer Identifiers using the Smart Collect APIs to accept large payments from your customers in the form of bank transfers via NEFT, RTGS and IMPS.

List of APIs
﻿Create a Customer Identifier With Bank Account Receiver﻿
﻿Update a Customer Identifier﻿
﻿Fetch a Customer Identifier Using ID﻿
﻿Fetch All Customer Identifiers﻿
﻿Fetch Payments for a Customer Identifier﻿
﻿Fetch Payments Made By Bank Transfer﻿
﻿Fetch Payments Using UTR Number﻿
﻿Close a Customer Identifier﻿
If you are a new customer, explore Smart Collect 2.0. It uses the same APIs as Smart Collect, while also offering additional endpoints—such as creating a Customer Identifier with a VPA and bank account, fetching UPI payments, and adding a VPA Receiver to an existing Customer Identifier.
You can also Add an Allowed Payer or Delete an Allowed Payer using Smart Collect TPV APIs.
Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
POST
Create a Customer Identifier With Bank Account Receiver
https://api.razorpay.com/v1/virtual_accounts
You can use this API to create a customer identifier with bank account receiver.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
View More
json
{
  "receivers": {
    "types": [
      "bank_account"
    ],
    "bank_account": {}
  },
  "description": "Customer Identifier created for Raftar Soft",
  "customer_id": "cust_CaVDm8eDRSXYME",
  "close_by": 1754462810,
  "notes": {
    "project_name": "Banking Software"
  }
}
Example
Create a Customer Identifier with Bank Account Receiver
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/virtual_accounts' \
--data '{
  "receivers": {
    "types": [
      "bank_account"
    ],
    "bank_account": {}
  },
  "description": "Customer Identifier created for Raftar Soft",
  "customer_id": "cust_CaVDm8eDRSXYME",
  "close_by": 1754462810,
  "notes": {
    "project_name": "Banking Software"
  }
}'
200 OK
Response
Body
Headers (13)
View More
Text
{
    "id": "va_R1wzcp1PeFfY2Q",
    "name": "Bertie Botts",
    "entity": "virtual_account",
    "status": "active",
    "description": "Customer Identifier created for Raftar Soft",
    "amount_expected": null,
    "notes": {
        "project_name": "Banking Software"
    },
    "amount_paid": 0,
    "customer_id": "cust_CaVDm8eDRSXYME",
    "receivers": [
        {
            "id": "ba_R1wzd3AOGaDOob",
            "entity": "bank_account",
            "ifsc": "RAZR0000001",
            "bank_name": null,
            "name": "Bertie Botts",
            "notes": [],
            "account_number": "1112220058131111"
        }
    ],
    "close_by": 1754462810,
    "closed_at": null,
    "created_at": 1754461831
}
PATCH
Update a Customer Identifier
https://api.razorpay.com/v1/virtual_accounts/va_R2L7NJvflSy4IQ
You can use this API to update a customer identifier. You cannot update the expiry date of a Customer Identifier that has been closed.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
json
{
    "close_by": 1981615845,
    "description": "VA creation for Raftar Soft",
    "notes": {
        "project_name": "Banking Software Work"
    }
}
Example
Update a Customer Identifier
Request
View More
cURL
curl --location --request PATCH 'https://api.razorpay.com/v1/virtual_accounts/va_R2L7NJvflSy4IQ' \
--data '{
    "close_by": 1981615845,
    "description": "VA creation for Raftar Soft",
    "notes": {
        "project_name": "Banking Software Work"
    }
}
'
200 OK
Response
Body
Headers (12)
View More
Text
{
    "id": "va_R2L7NJvflSy4IQ",
    "name": "Bertie Botts",
    "entity": "virtual_account",
    "status": "active",
    "description": "VA creation for Raftar Soft",
    "amount_expected": null,
    "notes": {
        "project_name": "Banking Software Work"
    },
    "amount_paid": 0,
    "customer_id": null,
    "receivers": [
        {
            "id": "ba_R2L7NYkZ1jFY5I",
            "entity": "bank_account",
            "ifsc": "RAZR0000001",
            "bank_name": null,
            "name": "Bertie Botts",
            "notes": [],
            "account_number": "1112220048361111"
        }
    ],
    "close_by": 1981615845,
    "closed_at": null,
    "created_at": 1754546790
}
GET
Fetch a Customer Identifier Using ID
https://api.razorpay.com/v1/virtual_accounts/va_R1wzcp1PeFfY2Q
You can use this API to fetch a customer identifier using id.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch a Customer Identifier Using ID
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/virtual_accounts/va_R1wzcp1PeFfY2Q' \
--data ''
200 OK
Response
Body
Headers (12)
View More
Text
{
    "id": "va_R1wzcp1PeFfY2Q",
    "name": "Bertie Botts",
    "entity": "virtual_account",
    "status": "closed",
    "description": "Customer Identifier created for Raftar Soft",
    "amount_expected": null,
    "notes": {
        "project_name": "Banking Software"
    },
    "amount_paid": 0,
    "customer_id": "cust_CaVDm8eDRSXYME",
    "receivers": [
        {
            "id": "ba_R1wzd3AOGaDOob",
            "entity": "bank_account",
            "ifsc": "RAZR0000001",
            "bank_name": null,
            "name": "Bertie Botts",
            "notes": [],
            "account_number": "1112220058131111"
        }
    ],
    "close_by": 1754462810,
    "closed_at": 1754559572,
    "created_at": 1754461831
}
GET
Fetch All Customer Identifiers
https://api.razorpay.com/v1/virtual_accounts?count=2
You can use this API to retrieve details of all Customer Identifiers.

Authorization
Basic Auth
Username
<username>
Password
<password>
Query Params
count
2
Example
Fetch All Customer Identifiers
Request
cURL
curl --location 'https://api.razorpay.com/v1/virtual_accounts?count=2' \
--header 'Content-Type: application/json' \
--data ''
200 OK
Response
Body
Headers (12)
View More
Text
{
    "entity": "collection",
    "count": 2,
    "items": [
        {
            "id": "va_R4MWY7jMxZg3L0",
            "name": "Bertie Botts",
            "entity": "virtual_account",
            "status": "closed",
            "description": "Customer Identifier created for Raftar Soft",
            "amount_expected": null,
            "notes": {
                "project_name": "Banking Software"
            },
            "amount_paid": 0,
            "customer_id": "cust_CaVDm8eDRSXYME",
            "receivers": [
                {
                    "id": "ba_R4MWYScfbggbJU",
                    "entity": "bank_account",
                    "ifsc": "RAZR0000001",
                    "bank_name": null,
                    "name": "Bertie Botts",
                    "notes": [],
                    "account_number": "1112220084771111"
                }
            ],
            "close_by": 1754990049,
            "closed_at": 1754990222,
            "created_at": 1754988421
        },
        {
            "id": "va_R4MTdBPQM0YVt0",
            "name": "Bertie Botts",
            "entity": "virtual_account",
            "status": "closed",
            "description": "Customer Identifier created for Raftar Soft",
            "amount_expected": null,
            "notes": {
                "project_name": "Banking Software"
            },
            "amount_paid": 0,
            "customer_id": "cust_CaVDm8eDRSXYME",
            "receivers": [
                {
                    "id": "ba_R4MTdSPyZMhb6c",
                    "entity": "bank_account",
                    "ifsc": "RAZR0000001",
                    "bank_name": null,
                    "name": "Bertie Botts",
                    "notes": [],
                    "account_number": "1112220087251111"
                }
            ],
            "close_by": 1754990049,
            "closed_at": 1754990222,
            "created_at": 1754988256
        }
    ]
}
GET
Fetch Payments for a Customer Identifier
https://api.razorpay.com/v1/virtual_accounts/va_N9QmVQHR4rd62a/payments
You can use this API to retrieve payment details for a single Customer Identifier by id.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch Payments for a Customer Identifier
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/virtual_accounts/va_N9QmVQHR4rd62a/payments' \
--header 'Content-Type: application/json' \
--data ''
200 OK
Response
Body
Headers (13)
View More
Text
{
    "entity": "collection",
    "count": 1,
    "items": [
        {
            "id": "pay_N9QnEcRRFDZ9Dp",
            "entity": "payment",
            "amount": 100000,
            "currency": "INR",
            "status": "captured",
            "order_id": null,
            "invoice_id": null,
            "international": false,
            "method": "bank_transfer",
            "amount_refunded": 0,
            "refund_status": null,
            "captured": true,
            "description": "",
            "card_id": null,
            "bank": null,
            "wallet": null,
            "vpa": null,
            "email": "gaurav.kumar@example.com",
            "contact": "+919000090000",
            "customer_id": "cust_Lziks07AYsTcEP",
            "notes": [],
            "fee": 1180,
            "tax": 180,
            "error_code": null,
            "error_description": null,
            "error_source": null,
            "error_step": null,
            "error_reason": null,
            "acquirer_data": {},
            "created_at": 1701946810
        }
    ]
}
GET
Fetch Payments Made By Bank Transfer
https://api.razorpay.com/v1/payments/pay_CmiztqmYJPtDAu/bank_transfer
You can use this API to retrieve details of payments made using the bank transfer method. If Razorpay does not receive the bank account information of the customer from the remitting bank, the payer_bank_account parameter will be set to null.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch Payments Made By Bank Transfer
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/payments/pay_CmiztqmYJPtDAu/bank_transfer' \
--header 'Content-Type: application/json' \
--data ''
200 OK
Response
Body
Headers (12)
View More
Text
{
    "id": "bt_Cmiztq7exvKn20",
    "entity": "bank_transfer",
    "payment_id": "pay_CmiztqmYJPtDAu",
    "mode": "NEFT",
    "bank_reference": "156161823051",
    "amount": 1278000,
    "payer_bank_account": {
        "id": "ba_Cmiztzg8xGaB1a",
        "entity": "bank_account",
        "ifsc": null,
        "bank_name": null,
        "name": "Bertie Botts",
        "notes": [],
        "account_number": "765432123451111"
    },
    "virtual_account_id": "va_CminDKtoToBGmd",
    "virtual_account": {
        "id": "va_CminDKtoToBGmd",
        "name": "Bertie Botts",
        "entity": "virtual_account",
        "status": "closed",
        "description": "Receiving payment for software services provided",
        "amount_expected": null,
        "notes": [],
        "amount_paid": 1278000,
        "customer_id": "cust_CmhwIO0JKvff14",
        "receivers": [
            {
                "id": "ba_CminDN4dnF3QnA",
                "entity": "bank_account",
                "ifsc": "RAZR0000001",
                "bank_name": null,
                "name": "Bertie Botts",
                "notes": [],
                "account_number": "1112220069781111"
            }
        ],
        "close_by": 1561879800,
        "closed_at": 1561880823,
        "created_at": 1561617510
    }
}
GET
Fetch Payments Using UTR Number
https://api.razorpay.com/v1/payments?skip=0&count=25&va_transaction_id=209817848101&virtual_account=1
You can use this API to retrieve details of payments made using the bank transfer method via UTR.

Authorization
Basic Auth
Username
<username>
Password
<password>
Query Params
skip
0
count
25
va_transaction_id
209817848101
virtual_account
1
Example
Fetch Payments Using UTR Number
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/payments?skip=0&count=25&va_transaction_id=209817848101&virtual_account=1' \
--header 'Content-Type: application/json' \
--data ''
200 OK
Response
Body
Headers (11)
View More
Text
{
    "entity": "collection",
    "count": 1,
    "items": [
        {
            "acquirer_data": {
                "rrn": "209817848101"
            },
            "amount": 1000,
            "amount_refunded": 0,
            "bank": null,
            "captured": true,
            "card_id": null,
            "contact": "+919900990099",
            "created_at": 1649402719,
            "currency": "INR",
            "customer_id": "cust_HWj3MjySAHSjtq",
            "description": null,
            "email": "gaurav.kumar@example.com",
            "entity": "payment",
            "error_code": null,
            "error_description": null,
            "error_reason": null,
            "error_source": null,
            "error_step": null,
            "fee": 12,
            "id": "pay_JGmL38CqCHTyZZ",
            "international": false,
            "invoice_id": null,
            "method": "upi",
            "notes": [],
            "order_id": null,
            "refund_status": null,
            "status": "captured",
            "tax": 2,
            "upi": {
                "flow": "collect",
                "vpa": "gaurav.kumar@okhdfcbank"
            },
            "vpa": "gaurav.kumar@okhdfcbank",
            "wallet": null
        }
    ]
}
POST
Close a Customer Identifier
https://api.razorpay.com/v1/virtual_accounts/va_R1wzcp1PeFfY2Q/close
You can use this API to close a Customer Identifier.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Close a Customer Identifier
Request
View More
cURL
curl --location --request POST 'https://api.razorpay.com/v1/virtual_accounts/va_R1wzcp1PeFfY2Q/close' \
--data ''
200 OK
Response
Body
Headers (12)
View More
Text
{
    "id": "va_R1wzcp1PeFfY2Q",
    "name": "Bertie Botts",
    "entity": "virtual_account",
    "status": "closed",
    "description": "Customer Identifier created for Raftar Soft",
    "amount_expected": null,
    "notes": {
        "project_name": "Banking Software"
    },
    "amount_paid": 0,
    "customer_id": "cust_CaVDm8eDRSXYME",
    "receivers": [
        {
            "id": "ba_R1wzd3AOGaDOob",
            "entity": "bank_account",
            "ifsc": "RAZR0000001",
            "bank_name": null,
            "name": "Bertie Botts",
            "notes": [],
            "account_number": "1112220058131111"
        }
    ],
    "close_by": 1754462810,
    "closed_at": 1754559572,
    "created_at": 1754461831
}
Smart Collect -TPV
You can create Customer Identifiers using the Smart Collect APIs to accept large payments from your customers in the form of bank transfers via NEFT, RTGS and IMPS. In addition, you can also add an Allowed Payer or delete an Allowed payer using Smart Collect TPV APIs.

Know more about

﻿third-party validation﻿

.

If you are a new customer, explore . It uses the same APIs as Smart Collect, while also offering additional endpoints—such as creating a Customer Identifier with a VPA and bank account, fetching UPI payments, and adding a VPA Receiver to an existing Customer Identifier.

List of APIs:

﻿Create a Customer Identifier With TPV﻿
﻿Add an Allowed Payer With TPV﻿
﻿Fetch a Customer Identifier Using ID With TPV﻿
﻿Fetch All Customer Identifiers With TPV﻿
﻿Fetch Payments for a Customer Identifier With TPV﻿
﻿Fetch Payment Details Using ID and Transfer Method With TPV﻿
﻿Delete an Allowed Payer With TPV﻿
Authorization
Basic Auth
This folder is using an authorization helper from collection Razorpay APIs
POST
Create a Customer Identifier With TPV
https://api.razorpay.com/v1/virtual_accounts
You can use this API to create a Customer Identifier. While sharing the details of CIs (created using RBL bank) with the customers, ensure that the fifth character in the IFSC is number 0 and not the letter O. For example, valid IFSC is RATN0VAAPIS and not RATNOVAAPIS.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
View More
json
{
    "receivers": {
        "types": [
            "bank_account"
        ]
    },
    "allowed_payers": [
        {
            "type": "bank_account",
            "bank_account": {
                "ifsc": "UTIB0000013",
                "account_number": "914010012345679"
            }
        },
        {
            "type": "bank_account",
            "bank_account": {
                "ifsc": "UTIB0000014",
                "account_number": "914010012345680"
            }
        }
    ],
    "description": "Customer Identifier created for Raftar Soft",
    "customer_id": "cust_CaVDm8eDRSXYME",
    "close_by": 1754980270,
    "notes": {
        "project_name": "Banking Software"
    }
}
Example
Create a Customer Identifier With TPV
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/virtual_accounts' \
--data '{
    "receivers": {
        "types": [
            "bank_account"
        ]
    },
    "allowed_payers": [
        {
            "type": "bank_account",
            "bank_account": {
                "ifsc": "UTIB0000013",
                "account_number": "914010012345679"
            }
        },
        {
            "type": "bank_account",
            "bank_account": {
                "ifsc": "UTIB0000014",
                "account_number": "914010012345680"
            }
        }
    ],
    "description": "Customer Identifier created for Raftar Soft",
    "customer_id": "cust_CaVDm8eDRSXYME",
    "close_by": 1754977543,
    "notes": {
        "project_name": "Banking Software"
    }
}
'
200 OK
Response
Body
Headers (13)
View More
Text
{
    "id": "va_R4J8fHo3i2z6b7",
    "name": "Bertie Botts",
    "entity": "virtual_account",
    "status": "active",
    "description": "Customer Identifier created for Raftar Soft",
    "amount_expected": null,
    "notes": {
        "project_name": "Banking Software"
    },
    "amount_paid": 0,
    "customer_id": "cust_CaVDm8eDRSXYME",
    "receivers": [
        {
            "id": "ba_R4J8fbBVoMQKsR",
            "entity": "bank_account",
            "ifsc": "RAZR0000001",
            "bank_name": null,
            "name": "Bertie Botts",
            "notes": [],
            "account_number": "1112220093781111"
        }
    ],
    "allowed_payers": [
        {
            "type": "bank_account",
            "id": "ba_R4J8feXjGTg9sA",
            "bank_account": {
                "ifsc": "UTIB0000013",
                "account_number": "914010012341111"
            }
        },
        {
            "type": "bank_account",
            "id": "ba_R4J8ff8dmpiLJc",
            "bank_account": {
                "ifsc": "UTIB0000014",
                "account_number": "914010012341111"
            }
        }
    ],
    "close_by": 1754977543,
    "closed_at": null,
    "created_at": 1754976500
}
POST
Add an Allowed Payer With TPV
https://api.razorpay.com/v1/virtual_accounts/va_R4J8fHo3i2z6b7/allowed_payers
You can use this API to add an allowed payer's account.

Authorization
Basic Auth
Username
<username>
Password
<password>
Body
raw (json)
json
{
   "type":"bank_account",
   "bank_account":{
      "ifsc":"UTIB0000013",
      "account_number":"914010012345678"
   }
}
Example
Add an Allowed Payer With TPV
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/virtual_accounts/va_R4J8fHo3i2z6b7/allowed_payers' \
--data '{
   "type":"bank_account",
   "bank_account":{
      "ifsc":"UTIB0000013",
      "account_number":"914010012345678"
   }
}'
200 OK
Response
Body
Headers (12)
View More
Text
{
    "id": "va_R4J8fHo3i2z6b7",
    "name": "Bertie Botts",
    "entity": "virtual_account",
    "status": "active",
    "description": "Customer Identifier created for Raftar Soft",
    "amount_expected": null,
    "notes": {
        "project_name": "Banking Software"
    },
    "amount_paid": 0,
    "customer_id": "cust_CaVDm8eDRSXYME",
    "receivers": [
        {
            "id": "ba_R4J8fbBVoMQKsR",
            "entity": "bank_account",
            "ifsc": "RAZR0000001",
            "bank_name": null,
            "name": "Bertie Botts",
            "notes": [],
            "account_number": "1112220093781111"
        }
    ],
    "allowed_payers": [
        {
            "type": "bank_account",
            "id": "ba_R4J8feXjGTg9sA",
            "bank_account": {
                "ifsc": "UTIB0000013",
                "account_number": "914010012341111"
            }
        },
        {
            "type": "bank_account",
            "id": "ba_R4J8ff8dmpiLJc",
            "bank_account": {
                "ifsc": "UTIB0000014",
                "account_number": "914010012341111"
            }
        },
        {
            "type": "bank_account",
            "id": "ba_R4JKq6nc0wMdEu",
            "bank_account": {
                "ifsc": "UTIB0000013",
                "account_number": "914010012341111"
            }
        }
    ],
    "close_by": 1754977543,
    "closed_at": null,
    "created_at": 1754976500
}
GET
Fetch a Customer Identifier Using ID With TPV
https://api.razorpay.com/v1/virtual_accounts/va_R4J8fHo3i2z6b7
You can use this API to fetch a Customer Identifier using id.

Authorization
Basic Auth
Username
<username>
Password
<password>
Example
Fetch a Customer Identifier Using ID With TPV
Request
View More
cURL
curl --location 'https://api.razorpay.com/v1/virtual_accounts/va_R4J8fHo3i2z6b7' \
--data ''
200 OK
Response
Body
Headers (12)
View More
Text
{
    "id": "va_R4J8fHo3i2z6b7",
    "name": "Bertie Botts",
    "entity": "virtual_account",
    "status": "active",
    "description": "Customer Identifier created for Raftar Soft",
    "amount_expected": null,
    "notes": {
        "project_name": "Banking Software"
    },
    "amount_paid": 0,