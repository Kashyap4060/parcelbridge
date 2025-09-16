Integration Steps
Integrate your Node.js-based website with our SDK to start accepting payments using the Razorpay Payment Gateway
Integrate With Razorpay Payment Gateway
Start accepting domestic and international payments from customers on your website using the Razorpay Payment Gateway. Razorpay has developed the Standard Checkout method and manages it. You can configure payment methods, orders, company logo and also select custom colour based on your convenience. Razorpay supports these payment methods and international currencies.
    UPI, CARDS, NETBANKING, EMI,WALLET,PAYLATER
1. Build Integration
1.1 Instantiate Razorpay
In your server file, instantiate the Razorpay instance with your key_id and key_secret. You should generate the API keys on the Dashboard and add them here.

Given below is the command:

Instantiate the Razorpay instance 
        var instance = new Razorpay({
  key_id: 'YOUR_KEY_ID',
  key_secret: 'YOUR_KEY_SECRET',
});

The resources can be accessed using the instance. All the methods invocations follow the namespaced signature:

// API signature
// {razorpayInstance}.{resourceName}.{methodName}(resourceId [, params])
// example

instance.payments.fetch(paymentId)


Every resource method returns a promise.

Promise
instance.payments.all({
  from: '2016-08-01',
  to: '2016-08-20'
}).then((response) => {
  // handle success
}).catch((error) => {
  // handle error
})

If you want to use callbacks instead of promises, every resource method accepts a callback function as the last parameter. The callback function acts as Error First Callbacks.

instance.payments.all({
  from: '2016-08-01',
  to: '2016-08-20'
}, (error, response) => {
  if (error) {
    // handle error
  } else {
    // handle success
  }
})

1.2 Create an Order in Server
Order is an important step in the payment process.

An order should be created for every payment.
You can create an order using the Orders API in the app.js file. It is a server-side API call. Know how to authenticate Orders API.
The order_id received in the response should be passed to checkout in the index.html file. This ties the Order with the payment and secures the request from being tampered.

1.2.1 Sample Code
In the sample app, the app.js file contains the code for order creation using Orders API.

Request
const Razorpay = require('razorpay');
var instance = new Razorpay({ key_id: 'YOUR_KEY_ID', key_secret: 'YOUR_SECRET' })

var options = {
  amount: 50000,  // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
  currency: "INR",
  receipt: "order_rcptid_11"
};
instance.orders.create(options, function(err, order) {
  console.log(order);
});

Response
{
  "id": "order_DBJOWzybf0sJbb",
  "entity": "order",
  "amount": 50000,
  "amount_paid": 0,
  "amount_due": 50000,
  "currency": "INR",
  "receipt": "order_rcptid_11",
  "status": "created",
  "attempts": 0,
  "notes": [],
  "created_at": 1566986570
}


1.2.2 Request Parameters
Here is the list of parameters for creating an order:

amount : mandatory

integer Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is ₹299.00, then pass 29900 in this field. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.991, pass the value as 295990. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as 295.
Watch Out!

As per payment guidelines, you should pass the last decimal number as 0 for three decimal currency payments. For example, if you want to charge a customer 99.991 KD for a transaction, you should pass the value for the amount parameter as 99990 and not 99991.


currency:mandatory

string The currency in which the transaction should be made. See the list of supported currencies. Length must be 3 characters.
Handy Tips

Razorpay has added support for zero decimal currencies, such as JPY, and three decimal currencies, such as KWD, BHD, and OMR, allowing businesses to accept international payments in these currencies. Know more about Currency Conversion (May 2024).


receipt:optional

string Your receipt id for this order should be passed here. Maximum length is 40 characters.

notes:optional

json object Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, "note_key": "Beam me up Scotty”.

partial_payment:optional

boolean Indicates whether the customer can make a partial payment. Possible values:
true: The customer can make partial payments.
false (default): The customer cannot make partial payments.

first_payment_min_amount:optional

integer Minimum amount that must be paid by the customer as the first partial payment. For example, if an amount of ₹7,000.00 is to be received from the customer in two installments of #1 - ₹5,000.00, #2 - ₹2,000.00 then you can set this value as 500000. This parameter should be passed only if partial_payment is true.


1.2.3 Response Parameters
Descriptions for the response parameters are present below
The Orders entity has the following parameters:

Entity


{
  "id": "order_DaZlswtdcn9UNV",
  "entity": "order",
  "amount": 50000,
  "amount_paid": 0,
  "amount_due": 50000,
  "currency": "INR",
  "receipt": "Receipt #20",
  "status": "created",
  "attempts": 0,
  "notes": {
    "key1": "value1",
    "key2": "value2"
  },
  "created_at": 1572502745
}

id:string
The unique identifier of the order.

amount* integer
Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is ₹299.00, then pass 29900 in this field. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.991, pass the value as 295990. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as 295.
Watch Out!

As per payment guidelines, you should pass the last decimal number as 0 for three decimal currency payments. For example, if you want to charge a customer 99.991 KD for a transaction, you should pass the value for the amount parameter as 99990 and not 99991.


amount_paid
integer
The amount paid against the order.

amount_due
integer
The amount pending against the order.

currency *string
ISO code for the currency in which you want to accept the payment. The default length is 3 characters. Refer to the list of supported currencies.
Handy Tips

Razorpay has added support for zero decimal currencies, such as JPY, and three decimal currencies, such as KWD, BHD, and OMR, allowing businesses to accept international payments in these currencies. Know more about Currency Conversion (May 2024).


receipt :string
Receipt number that corresponds to this order. Can have a maximum length of 40 characters and has to be unique.

status :string
The status of the order. Possible values:
created: When you create an order it is in the created state. It stays in this state till a payment is attempted on it.
attempted: An order moves from created to attempted state when a payment is first attempted on it. It remains in the attempted state till one payment associated with that order is captured.
paid: After the successful capture of the payment, the order moves to the paid state. No further payment requests are permitted once the order moves to the paid state. The order stays in the paid state even if the payment associated with the order is refunded.

attempts:integer
The number of payment attempts, successful and failed, that have been made against this order.

notes:json object
Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, "note_key": "Beam me up Scotty”.

created_at:integer
Indicates the Unix timestamp when this order was created.

1.2.4 Error Response Parameters
The error response parameters are available in the API Reference Guide.

Errors
Error Status: 400

Authentication failed.

The API credentials passed in the API call differ from the ones generated on the Dashboard. Possible reasons:
Different keys for test mode and live modes.
Expired API key.

Solution

The API keys must be active and entered correctly with no whitespace before or after the keys.

Error Status: 400

The amount must be atleast INR 1.00.

The amount specified is less than the minimum amount. Currency subunits, such as paise (in the case of INR), should always be greater than 100.

Solution

Enter an amount equal to or greater than the minimum amount, that is 100.

Error Status: 400

The field name is required.

A mandatory field is missing.

Solution

Ensure all mandatory fields and values are present.

1.3 Add Checkout Options
Add the Razorpay Checkout options to your project. For example, if you are using HTML for your frontend, create a page called index.html and add the Pay button on your web page using the checkout code and either the callback URL or handler function.

1.3.1 Callback URL or Handler Function

Callback URL	
When you use this:
On successful payment, the customer is redirected to the specified URL, for example, a payment success page.
On failure, the customer is asked to retry the payment.

Handler Function
When you use this:
On successful payment, the customer is shown your web page.
On failure, the customer is notified of the failure and asked to retry the payment.

1.3.2 Code to Add Pay Button
Copy-paste the parameters as options in your code:

Handy Tips

You can also integrate the Razorpay Checkout with React.js using the sample code.

Node.js Checkout Code
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Razorpay Payment</title>
</head>
<body>
  <h1>Razorpay Payment Gateway Integration</h1>
  <form id="payment-form">
    <label for="amount">Amount:</label>
    <input type="number" id="amount" name="amount" required>
    <button type="button" onclick="payNow()">Pay Now</button>
  </form>

  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <script>
    async function payNow() {
      const amount = document.getElementById('amount').value;

      // Create order by calling the server endpoint
      const response = await fetch('/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, currency: 'INR', receipt: 'receipt#1', notes: {} })
      });

      const order = await response.json();

      // Open Razorpay Checkout
      const options = {
        key: 'YOUR_KEY_ID', // Replace with your Razorpay key_id
        amount: '50000', // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: 'INR',
        name: 'Acme Corp',
        description: 'Test Transaction',
        order_id: 'order_IluGWxBm9U8zJ8', // This is the order_id created in the backend
        callback_url: 'http://localhost:3000/payment-success', // Your success URL
        prefill: {
          name: 'Gaurav Kumar',
          email: 'gaurav.kumar@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#F37254'
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    }
  </script>
</body>
</html>


Callback URL (JS) Checkout Code
<button id="rzp-button1">Pay with Razorpay</button>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
var options = {
    "key": "YOUR_KEY_ID", // Enter the Key ID generated from the Dashboard
    "amount": "50000", // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    "currency": "INR",
    "name": "Acme Corp",
    "description": "Test Transaction",
    "image": "https://example.com/your_logo",
    "order_id": "order_IluGWxBm9U8zJ8", //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    "callback_url": "https://eneqd3r9zrjok.x.pipedream.net/",
    "prefill": {
        "name": "Gaurav Kumar",
        "email": "gaurav.kumar@example.com",
        "contact": "9000090000"
    },
    "notes": {
        "address": "Razorpay Corporate Office"
    },
    "theme": {
        "color": "#3399cc"
    }
};
var rzp1 = new Razorpay(options);
document.getElementById('rzp-button1').onclick = function(e){
    rzp1.open();
    e.preventDefault();
}
</script>

1.3.3 Checkout Options

key:mandatory

string
API Key ID generated from the Dashboard.

amount:mandatory

integer
 Payment amount in the smallest currency subunit. For example, if the amount to be charged is ₹2,222.50, enter 222250 in this field. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.991, pass the value as 295990. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as 295.
Watch Out!

As per payment guidelines, you should pass the last decimal number as 0 for three decimal currency payments. For example, if you want to charge a customer 99.991 KD for a transaction, you should pass the value for the amount parameter as 99990 and not 99991.


currency :mandatory

string 
The currency in which the payment should be made by the customer. See the list of supported currencies.
Handy Tips

Razorpay has added support for zero decimal currencies, such as JPY, and three decimal currencies, such as KWD, BHD, and OMR, allowing businesses to accept international payments in these currencies. Know more about Currency Conversion (May 2024).


name:mandatory

string
Your Business/Enterprise name shown on the Checkout form. For example, Acme Corp.

description:optional

string 
Description of the purchase item shown on the Checkout form. It should start with an alphanumeric character.

image:optional

string 
Link to an image (usually your business logo) shown on the Checkout form. Can also be a base64 string if you are not loading the image from a network.

order_id:mandatory

string
Order ID generated via Orders API.

prefill

object You can prefill the following details at Checkout.
Boost Conversions and Minimise Drop-offs

Autofill customer contact details, especially phone number to ease form completion. Include customer’s phone number in the contact parameter of the JSON request's prefill object. Format: +(country code)(phone number). Example: "contact": "+919000090000".
This is not applicable if you do not collect customer contact details on your website before checkout, have Shopify stores or use any of the no-code apps.

notes:optional

object 
Set of key-value pairs that can be used to store additional information about the payment. It can hold a maximum of 15 key-value pairs, each 256 characters long (maximum).

theme

object Thematic options to modify the appearance of Checkout.

modal

object Options to handle the Checkout modal.

subscription_id:optional

string 
If you are accepting recurring payments using Razorpay Checkout, you should pass the relevant subscription_id to the Checkout. Know more about Subscriptions on Checkout.

subscription_card_change:optional

boolean 
Permit or restrict customer from changing the card linked to the subscription. You can also do this from the hosted page. Possible values:
true: Allow the customer to change the card from Checkout.
false (default): Do not allow the customer to change the card from Checkout.

recurring:optional

boolean
 Determines if you are accepting recurring (charge-at-will) payments on Checkout via instruments such as emandate, paper NACH and so on. Possible values:
true: You are accepting recurring payments.
false (default): You are not accepting recurring payments.

callback_url:optional

string
 Customers will be redirected to this URL on successful payment. Ensure that the domain of the Callback URL is allowlisted.

redirect:optional
boolean
 Determines whether to post a response to the event handler post payment completion or redirect to Callback URL. callback_url must be passed while using this parameter. Possible values:
true: Customer is redirected to the specified callback URL in case of payment failure.
false (default): Customer is shown the Checkout popup to retry the payment with the suggested next best option.

customer_id:optional

string
 Unique identifier of customer. Used for:
Local saved cards feature.
Static bank account details on Checkout in case of Bank Transfer payment method.

remember_customer:optional

boolean 
Determines whether to allow saving of cards. Can also be configured via the Dashboard. Possible values:
true: Enables card saving feature.
false (default): Disables card saving feature.

timeout

optional

integer Sets a timeout on Checkout, in seconds. After the specified time limit, the customer will not be able to use Checkout.
Watch Out!

Some browsers may pause JavaScript timers when the user switches tabs, especially in power saver mode. This can cause the checkout session to stay active beyond the set timeout duration.


readonly

object Marks fields as read-only.

hidden

object Hides the contact details.

send_sms_hash:optional

boolean Used to auto-read OTP for cards and netbanking pages. Applicable from Android SDK version 1.5.9 and above. Possible values:
true: OTP is auto-read.
false (default): OTP is not auto-read.

allow_rotation:optional

boolean Used to rotate payment page as per screen orientation. Applicable from Android SDK version 1.6.4 and above. Possible values:
true: Payment page can be rotated.
false (default): Payment page cannot be rotated.

retry:optional

object Parameters that enable retry of payment on the checkout.

config :optional

object Parameters that enable configuration of checkout display language.



1.3.4 Handle Payment Success and Failure

The way the Payment Success and Failure scenarios are handled depends on the Checkout Sample Code you used in the last step.

Checkout with Callback URL
If you used the sample code with the callback URL:


On Payment Success

Razorpay makes a POST call to the callback URL with the razorpay_payment_id, razorpay_order_id and razorpay_signature in the response object of the successful payment. Only successful authorisations are auto-submitted.

On Payment Failure
In case of failed payments, the checkout is displayed again to facilitate payment retry.

Checkout with Handler Function
If you used the sample code with the handler function:


On Payment Success

The customer sees your website page. The checkout returns the response object of the successful payment (razorpay_payment_id, razorpay_order_id and razorpay_signature). Collect these and send them to your server.

On Payment Failure
The customer is notified about payment failure and asked to retry the payment.

Use the Success/Failure Handling code given below:

Success Handling code
"handler": function (response){
    alert(response.razorpay_payment_id);
    alert(response.razorpay_order_id);
    alert(response.razorpay_signature)}


Failure Handling code
rzp1.on('payment.failed', function (response){
    alert(response.error.code);
    alert(response.error.description);
    alert(response.error.source);
    alert(response.error.step);
    alert(response.error.reason);
    alert(response.error.metadata.order_id);
    alert(response.error.metadata.payment_id);
}


1.3.5 Configure Payment Methods (Optional)
Multiple payment methods are available on Razorpay Standard Checkout.

The payment methods are fixed and cannot be changed.
You can configure the order or make certain payment methods prominent. Know more about configuring payment methods. Know more about configuring payment methods.


About Payment Methods Configuration
Configure the payment methods of your choice at Razorpay Checkout.

Available in

IN
India

MY
Malaysia

SG
Singapore

You can configure the payment methods of your choice on the Razorpay Checkout to provide a highly personalised experience for your customers. This provides a simple and accessible experience to your customers increasing your sales and your success rates.


Use Cases
Depending on the use cases that you might have, Razorpay allows you to create any configuration of the payment methods, of your choice:

Highlighting certain payment instruments on the Checkout. For example, Google Pay could be displayed outside the UPI block as a separate payment method. HDFC Netbanking could come out of the Netbanking container as a different payment method.

Restricting the kind of network, issuer, BIN and card type, different card properties, to accept payments. For example, you can choose to accept payments only from HDFC Visa Debit cards on the Checkout.

Removing a certain payment method or instrument. For example, any wallet can be removed as a payment instrument from wallets. The entire Netbanking block or a certain bank in Netbanking can be removed from the Checkout.

Reordering of payment methods on the Checkout. You can choose to arrange UPI as the first section instead of Cards on the Checkout. You can again order the PSPs within the UPI block according to your need.

Grouping of payment instruments. For example, you can choose to group Netbanking and UPI payment methods of a bank as a block that will be labelled as Pay via Bank on the Checkout.

Configuring Payment Methods
To control payment methods on the Checkout, there are different ways to pass the configuration to the Checkout:

Configure via Dashboard: Choose the payment methods and instruments you want to display at checkout, arrange them in your preferred order, and tailor the checkout experience to match your business needs. Create custom payment blocks for specific customer segments on the Razorpay Dashboard. Know more about Payment Configuration.
Pass Configuration at Runtime: Pass the configuration to the options parameter of the Checkout code at the run time. This is useful when you want to modify the order of the payment methods for a particular set of payments while rendering the Checkout. See the Sample Code for details.

Use a Configuration ID: Create a global setting of the payments as a Configuration ID and pass these values while creating the Order. This is useful when you want control the checkout configurations dynamically using different Configuration IDs. You can create a Configuration ID through the Dashboard. There are two ways to pass the Configuration ID:

While creating the order: Add the checkout_config_id field in the order creation request.
While opening the checkout: Include the checkout_config_id in the checkout options.
Pass config id
"checkout_config_id": "YourConfigIDHere"

Understand the Configuration
Understand the building blocks that are required to build a configuration of your choice.

Available in

IN
India

MY
Malaysia

SG
Singapore

Let us understand the building blocks that are required to build a configuration of your choice:

Payment Methods
Payment Instruments
Blocks
Sequence
Preferences
Payment Methods
Before deciding the payment methods or payment instruments that you want to configure on the Checkout, refer to the payment methods supported by Razorpay.

Payment Instruments
A payment instrument is a combination of the payment method and its associated properties. For example, a payment instrument can be an AXIS Debit card, where card is the payment method and the issuer (AXIS bank) is the associated instrument.

An instrument is a JSON object with a key named method. Each method and its associated properties are described in the sections below:

Card
Payment instruments for the method: card are listed below:

Name	Type	Description	Values	Examples
issuers	array	List of issuers that are allowed	Any bank code	issuers: ["HDFC", "ICIC"]
networks	array	List networks that are allowed	Any card network	networks: ["Visa", "MasterCard"]
types	array	List of card types that are allowed	Any card type	types: ["credit", "debit"]
JavaScript

copy

// beginning of the code
....
card: { \\name for cards
    name: "Pay Via Cards"
    instruments: [
      {
        method: "card",
        issuers: ["HDFC"],
        networks: ["Visa"],
        types: ["debit","credit"]
      }
    ]
},
...
//rest of the code
Netbanking
Payment instruments for the method: netbanking are listed below:

Name	Type	Description	Values	Examples
banks	array <string>	List of all banks that are allowed	Any bank code	banks: ["HDFC", "ICIC"]
Wallet
Payment instruments for the method: wallet are listed below:

Name	Type	Description	Values	Examples
wallets	string	Wallets to be allowed	Any wallet code	wallets: ["payzapp", "freecharge"]
UPI
Payment instruments for the method: upi are listed below:

Name	Type	Description	Values	Examples
flows	string	Flows to show	Any supported UPI flow	flows: [ "qr"]
apps	string	Apps to show, for intent	Any supported UPI apps	apps: ["google_pay", "phonepe"]
EMI
Payment instruments for the method: emi are listed below:

Name	Type	Description	Values	Examples
issuers	array <string>	Providers to be allowed	Any EMI issuers	issuers: ["HDFC, ICIC"]
types	array <string>	Providers to be allowed	Any credit and debit card EMI type	types: ["debit, credit"]
iins	array <string>	Providers to be allowed	Any EMI IIN	iins: ["438600"]
Cardless EMI
Payment instruments for the method: cardless_emi are listed below:

Name	Type	Description	Values	Examples
providers	string	Providers to be allowed	Any Cardless EMI provider	providers: ["zestmoney"]
Pay Later
For the method: paylater, the payment instruments are listed below:

Name	Type	Description	Values	Examples
providers	string	Providers to be allowed	Any paylater provider	providers: ["hdfc"]
Apps
For the method app, the payment instrument is listed below:

Name	Type	Description	Values	Examples
providers	string	Providers to be allowed	Any app provider	providers: ["cred"]
JavaScript

copy

// beginning of the code
....
{
  "custom": {
    "name": "Pay with Apps",
    "instruments": [
      {
        "method": "app",
        "providers": [
          "cred"
        ]
      }
    ]
  }
}
...
//rest of the code
Blocks
A block is a collection of one or more payment instruments. Each block has a name and code associated as shown below:

JavaScript

copy

// Block creation
let myPayments = {
  name: "My Custom Block",
  instruments: ["gpay", "freecharge"]
};
// Usage in config
let config = {
  display: {
    blocks: {
      highlighted: myPayments
    }
  }
};
Here, highlighted is the code associated with myPayments. Multiple blocks can be added to the config at the same time.

Sequence
You can specify the sequence, that is the order, in which the payment methods should be displayed on the Checkout.

A sequence is an array of strings, where each string is the name of the payment method or a block.

In a sequence, you can include any block using the block.${code} format. The block with code highlighted should be represented as block.highlighted as shown below:

JavaScript

copy

let sequence = ["block.highlighted", "upi", "netbanking"];
The above sequence will place the code highlighted first followed by the payment methods upi and netbanking in that particular order.

Handy Tips

Every block defined has to be present in the sequence. If you do not wish to reorder the methods and want to place your block, the sequence should contain block.highlighted with just one item in it.

Preferences
Using the preferences object, you can enhance the configuration of the Checkout. By setting this value, you can decide whether the default list of payment methods should be displayed or not.

Possible values are:

true

Checkout will display the sequence of the payment methods configured by you alongside with the default order of payment methods available in the Checkout.

false

Checkout will only show the sequence of the payment methods configured by you.

Hide Payment Instruments
You can also hide or remove certain instruments from the Checkout.

This is an array containing the method key used to hide either the payment method and/or the payment instrument associated with that payment method. For example, you can hide the methods, card and HDFC netbanking on the Checkout.

JavaScript

copy

let cardInstrument = {
  method: "card"
};

let instrumentOfSomeBank = {
  method: "netbanking",
  banks: ["HDFC"]
};

let hiddenInstruments = [cardInstrument, instrumentOfSomeBank];
This is an array containing the method key used to hide either the payment method and/or the payment instrument associated with that payment method. For example, you can hide the methods, card and Axis netbanking on the Checkout.

JavaScript

copy

let cardInstrument = {
  method: "card"
};

let instrumentOfSomeBank = {
  method: "netbanking",
  banks: ["UTIB"]
};

let hiddenInstruments = [cardInstrument, instrumentOfSomeBank];
Handy Tips

Hiding any instrument using hide does not affect the similar instrument defined in blocks. So, if you want to hide UTIB bank from netbanking and have defined the same instrument in one of your blocks, Axis bank will still be displayed in that block.



1.4 Store Fields in Your Server
A successful payment returns the following fields to the Checkout form.

You need to store these fields in your server.
You can confirm the authenticity of these details by verifying the signature in the next step.

Success fallback
{
  "razorpay_payment_id": "pay_29QQoUBi66xm2f",
  "razorpay_order_id": "order_9A33XWu170gUtm",
  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}

razorpay_payment_id

string Unique identifier for the payment returned by Checkout only for successful payments.

razorpay_order_id

string Unique identifier for the order returned by Checkout.

razorpay_signature

string Signature returned by the Checkout. This is used to verify the payment.
1.5 Verify Payment Signature
This is a mandatory step that allows you to confirm the authenticity of the details returned to the checkout for successful payments.

To verify the razorpay_signature returned to you by the checkout:

Create a signature in your server using the following attributes:

Attribute	Description
order_id	Retrieve the order_id from your server. Do not use the razorpay_order_id returned by checkout.
razorpay_payment_id	Returned during checkout.
key_secret	Available in your server. The key_secret that was generated from the Dashboard .
Use the SHA256 algorithm, the razorpay_payment_id and the order_id to construct an HMAC hex digest as shown below:


copy

generated_signature = hmac_sha256(order_id + "|" + razorpay_payment_id, secret);

    if (generated_signature == razorpay_signature) {
    payment is successful
     }
If the signature you generate on your server matches the razorpay_signature returned to you by the checkout, the payment received is from an authentic source.

Use the code given below to generate signature on your server:

Verify Payment Signature

copy

var instance = new Razorpay({ key_id: 'YOUR_KEY_ID', key_secret: 'YOUR_SECRET' })

var { validatePaymentVerification, validateWebhookSignature } = require('./dist/utils/razorpay-utils');
validatePaymentVerification({"order_id": razorpayOrderId, "payment_id": razorpayPaymentId }, signature, secret);
Add the following code in the front-end:

Call Signature Validate Method

copy

var settings = {
  "url": "/api/payment/verify",
  "method": "POST",
  "timeout": 0,
  "headers": {
   "Content-Type": "application/json"
  },
  "data": JSON.stringify({response}),
}

1.6 Verify Payment Status
Handy Tips

On the Dashboard, ensure that the payment status is captured. Refer to the payment capture settings page to know how to capture payments automatically.

You can track the payment status in three ways:


Verify Status from Dashboard


Subscribe to Webhook Events


Poll APIs

You can use Razorpay webhooks to configure and receive notifications when a specific event occurs. When one of these events is triggered, we send an HTTP POST payload in JSON to the webhook's configured URL. Know how to set up webhooks.

Example
If you have subscribed to the order.paid webhook event, you will receive a notification every time a customer pays you for an order.

Given below is the webhook signature verification sample code.

Node.js

copy

/* NODE SDK: https://github.com/razorpay/razorpay-node */
const {validateWebhookSignature} = require('razorpay/dist/utils/razorpay-utils')

validateWebhookSignature(JSON.stringify(webhookBody), webhookSignature, webhookSecret)
#webhook_body should be raw webhook request body

2. Test Integration
After the integration is complete, a Pay button appears on your webpage/app.

Test integration on your webpage/app
Click the button and make a test transaction to ensure the integration is working as expected. You can start accepting actual payments from your customers once the test transaction is successful.

You can make test payments using one of the payment methods configured at the Checkout.

Watch Out!

This is a mock payment page that uses your test API keys, test card and payment details.

Ensure you have entered only your Test Mode API keys in the Checkout code.
No real money is deducted due to the usage of test API keys. This is a simulated transaction.
Supported Payment Methods
Following are all the payment modes that the customer can use to complete the payment on the Checkout. Some of them are available by default, while others may require approval from us. Raise a request from the Dashboard to enable such payment methods.

Payment Method	Code	Availability
Debit Card	debit	✓
Credit Card	credit	✓
Netbanking	netbanking	✓
UPI	upi	✓
EMI - Credit Card EMI , Debit Card EMI and No Cost EMI	emi	✓
Wallet	wallet	✓
Cardless EMI	cardless_emi	Requires Approval .
Bank Transfer	bank_transfer	Requires Approval and Integration.
Emandate	emandate	Requires Approval and Integration.
Pay Later	paylater	Requires Approval .
Netbanking
You can select any of the listed banks. After choosing a bank, Razorpay will redirect to a mock page where you can make the payment success or a failure. Since this is Test Mode, we will not redirect you to the bank login portals.

Check the list of supported banks.

UPI
You can enter one of the following UPI IDs:

success@razorpay: To make the payment successful.
failure@razorpay: To fail the payment.
Check the list of supported UPI flows.

Handy Tips

You can use Test Mode to test UPI payments, and Live Mode for UPI Intent and QR payments.

Cards
You can use one of the following test cards to test transactions for your integration in Test Mode.

Use any valid expiration date in the future in the MM/YY format.
Use any random CVV to create a successful payment.
Card Network	Domestic / International	Card Number
Mastercard	Domestic	5267 3181 8797 5449
Visa	Domestic	4386 2894 0766 0153
Mastercard	International	5555 5555 5555 4444
5105 1051 0510 5100
Visa	International	4012 8888 8888 1881
5104 0600 0000 0008
Check the list of supported card networks.

Wallet
You can select any of the listed wallets. After choosing a wallet, Razorpay will redirect to a mock page where you can make the payment success or a failure. Since this is Test Mode, we will not redirect you to the wallet login portals.

Check the list of supported wallets.

3. Go-live Checklist
Check the go-live checklist for Razorpay Web Standard Checkout integration. Consider these steps before taking the integration live.

3.1 Accept Live Payments
You can perform an end-to-end simulation of funds flow in the Test Mode. Once confident that the integration is working as expected, switch to the Live Mode and start accepting payments from customers.

Watch Out!

Ensure you are switching your test API keys with API keys generated in Live Mode.

To generate API Keys in Live Mode on your Razorpay Dashboard:

Log in to the Razorpay Dashboard and switch to Live Mode on the menu.
Navigate to Account & Settings → API Keys → Generate Key to generate the API Key for Live Mode.
Download the keys and save them securely.
Replace the Test API Key with the Live Key in the Checkout code and start accepting actual payments.

3.2 Payment Capture
After payment is authorized, you need to capture it to settle the amount to your bank account as per the settlement schedule. Payments that are not captured are auto-refunded after a fixed time.

Watch Out

You should deliver the products or services to your customers only after the payment is captured. Razorpay automatically refunds all the uncaptured payments.
You can track the payment status using our Fetch a Payment API or webhooks.

Auto-capture Payments (Recommended)


Manually Capture Payments

Authorized payments can be automatically captured. You can auto-capture all payments using global settings on the Razorpay Dashboard. Know more about capture settings for payments.

Watch Out!

Payment capture settings work only if you have integrated with Orders API on your server side. Know more about the Orders API.

3.3 Set Up Webhooks
Ensure you have set up webhooks in the live mode and configured the events for which you want to receive notifications.

Integrate With Other Razorpay Products
Razorpay offers a range of payment products to meet your business requirements. Visit our GitHub repository for the sample codes.

Partner Authentication
If you are a partner and want to use the API as a particular merchant, you must authenticate your account by passing an additional header X-Razorpay-Account with the merchant account_id as the value.

Example

copy

var instance = new Razorpay({
  key_id: '<your_partner_key>',
  key_secret: '<your_partner_secret>',
  headers: {
    "X-Razorpay-Account": "<merchant_account_id>"
  }
});

instance.orders.all().then(console.log).catch(console.error);
Related Information