API Overview
🚄 Get Real-Time Indian Railway PNR Status Updates with Our API! 🚄

Stay informed with accurate and timely PNR status information directly from the Indian Railway Catering and Tourism Corporation (IRCTC) database. Whether you're a developer building a travel app or a railway enthusiast, our Indian Railway PNR Status API delivers the latest updates on passenger reservations. 📱🛤️ #IndianRailway #PNRStatus #TravelAPI

The Indian Railway PNR Status API provides real-time updates on the status of passenger reservations. Whether you are a developer building a travel application or a railway enthusiast looking to stay informed, this API delivers accurate and timely PNR status information directly from the Indian Railway Catering and Tourism Corporation (IRCTC) database.

Indian Railway PNR Status API Documentation

Overview
The Indian Railway PNR Status API provides real-time updates on the status of passenger reservations. This API fetches the current status of a passenger's PNR (Passenger Name Record) directly from the Indian Railway Catering and Tourism Corporation (IRCTC) database. It is ideal for developers building travel applications or for individuals seeking accurate and timely PNR status information.

Base URL
https://irctc-indian-railway-pnr-status.p.rapidapi.com

Endpoint
Get PNR Status
Retrieve the current status of a passenger's reservation using their PNR number. GET /getPNRStatus/{pnrNumber}

Request

HTTP Method: GET
URL: /getPNRStatus/{pnrNumber}
Example Request
curl --request GET \ --url https://irctc-indian-railway-pnr-status.p.rapidapi.com/getPNRStatus/2416902547 \ --header 'x-rapidapi-host: irctc-indian-railway-pnr-status.p.rapidapi.com' \ --header 'x-rapidapi-key: 27f1a26ea9mshbfae6d2228d1b3bp11e89bjsn639fe2867039'

Response
Content-Type: application/json
HTTP Status Codes:

200 OK: The request was successful, and the PNR status is returned.
400 Bad Request: The request was invalid or cannot be otherwise served.
404 Not Found: The specified PNR number does not exist.
500 Internal Server Error: An error occurred on the server.
{ "success": true, "data": { "pnrNumber": "2416902547", "journeyDetails": { "trainNumber": "12566", "trainName": "BIHAR S KRANTI", "boardingDate": "24-6-2024", "from": "NDLS", "to": "SV", "reservedUpto": "SV", "boardingPoint": "NDLS", "class": "3A" }, "passengerDetails": [ { "passengerNo": "Passenger 1", "bookingStatus": "CNF/B2/54/UB/PT", "currentStatus": "CNF", "coachNo": "" }, { "passengerNo": "Passenger 2", "bookingStatus": "CNF/B2/56/SU/PT", "currentStatus": "CNF", "coachNo": "" } ], "otherDetails": { "currency": "INR", "totalFare": "3250", "chartingStatus": "Chart Not Prepared", "remarksIfAny": "", "trainStatus": "" } }, "time": "2024-06-23T22:41:47.884Z" }

EXAMPLE RESPONSE IF THERE ARE 3 PASSENGER IN A SINGLE PNR NUMBER
{
  "success": true,
  "data": {
    "pnrNumber": "8524877966",
    "dateOfJourney": "Feb 9, 2025 11:30:05 AM",
    "trainNumber": "11061",
    "trainName": "LTT JAYNAGAR EXP",
    "sourceStation": "LTT",
    "destinationStation": "BSB",
    "reservationUpto": "BSB",
    "boardingPoint": "LTT",
    "journeyClass": "SL",
    "numberOfpassenger": 3,
    "chartStatus": "Chart Not Prepared",
    "informationMessage": [
      "",
      ""
    ],
    "passengerList": [
      {
        "passengerSerialNumber": 1,
        "passengerFoodChoice": "",
        "concessionOpted": false,
        "forGoConcessionOpted": false,
        "passengerIcardFlag": false,
        "childBerthFlag": false,
        "passengerNationality": "IN",
        "passengerQuota": "PQ",
        "passengerCoachPosition": 0,
        "waitListType": 10,
        "bookingStatusIndex": 0,
        "bookingStatus": "PQWL",
        "bookingCoachId": "",
        "bookingBerthNo": 35,
        "bookingStatusDetails": "PQWL/35",
        "currentStatusIndex": 0,
        "currentStatus": "CAN",
        "currentCoachId": "",
        "currentBerthNo": 0,
        "currentStatusDetails": "CAN"
      },
      {
        "passengerSerialNumber": 2,
        "passengerFoodChoice": "",
        "concessionOpted": false,
        "forGoConcessionOpted": false,
        "passengerIcardFlag": false,
        "childBerthFlag": false,
        "passengerNationality": "IN",
        "passengerQuota": "PQ",
        "passengerCoachPosition": 0,
        "waitListType": 10,
        "bookingStatusIndex": 0,
        "bookingStatus": "PQWL",
        "bookingCoachId": "",
        "bookingBerthNo": 36,
        "bookingStatusDetails": "PQWL/36",
        "currentStatusIndex": 0,
        "currentStatus": "CAN",
        "currentCoachId": "",
        "currentBerthNo": 0,
        "currentStatusDetails": "CAN"
      },
      {
        "passengerSerialNumber": 3,
        "passengerFoodChoice": "",
        "concessionOpted": false,
        "forGoConcessionOpted": false,
        "passengerIcardFlag": false,
        "childBerthFlag": false,
        "passengerNationality": "IN",
        "passengerQuota": "PQ",
        "passengerCoachPosition": 0,
        "waitListType": 10,
        "bookingStatusIndex": 0,
        "bookingStatus": "PQWL",
        "bookingCoachId": "",
        "bookingBerthNo": 37,
        "bookingStatusDetails": "PQWL/37",
        "currentStatusIndex": 0,
        "currentStatus": "CAN",
        "currentCoachId": "",
        "currentBerthNo": 0,
        "currentStatusDetails": "CAN"
      }
    ],
    "timeStamp": "Nov 29, 2024 7:58:05 PM",
    "bookingFare": 1830,
    "ticketFare": 0,
    "quota": "PQ",
    "reasonType": "S",
    "ticketTypeInPrs": "E",
    "waitListType": 0,
    "bookingDate": "Oct 26, 2024 12:00:00 AM",
    "arrivalDate": "Nov 30, 2024 12:25:05 PM",
    "mobileNumber": "",
    "distance": 1472,
    "isWL": "N"
  },
  "generatedTimeStamp": 1732890485447
}