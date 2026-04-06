/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {setGlobalOptions} = require("firebase-functions");
// const {onRequest} = require("firebase-functions/https");
// const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
// setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");

admin.initializeApp();
const db = admin.firestore();

exports.httpSmsWebhook = onRequest(async (req, res) => {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  // Validate Event Type Header
  const eventType = req.headers["x-event-type"];
  if (eventType !== "message.phone.received") {
    return res.status(200).send("Event ignored: not an incoming phone message");
  }

  // Verify Authorization Header (JWT)
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("Unauthorized webhook attempt: Missing/Invalid format");
    return res.status(401).send("Unauthorized");
  }

  const token = authHeader.split(" ")[1];
  const secret = "sms-webhook-secret";

  if (!secret) {
    console.error("Server Configuration Error: Missing Webhook Secret");
    return res.status(500).send("Internal Server Error");
  }

  try {
    jwt.verify(token, secret);
  } catch (error) {
    console.error("JWT Verification Failed:", error.message);
    return res.status(403).send("Forbidden: Invalid Signature");
  }

  try {
    const payload = req.body;
    const smsData = payload.data;
    
    if (!smsData || !smsData.contact || !smsData.content) {
      return res.status(400).send("Bad Request: Missing contact or content payload");
    }

    const senderNumber = smsData.contact; 
    const messageContent = smsData.content; 

    // Filter for SOS messages
    if (!messageContent.startsWith("SOS|")) {
      console.log(`Ignored non-emergency message from ${senderNumber}`);
      return res.status(200).send("Message ignored");
    }

    // Format from frontend: SOS|IncidentType-Name|PeopleCount|lat,lng
    const parts = messageContent.split("|");
    
    if (parts.length < 4) {
      console.warn("Malformed SOS message format:", messageContent);
      return res.status(400).send("Malformed message format");
    }

    const description = parts[1]; 
    const numberOfPeople = parseInt(parts[2], 10) || 1;
    const coords = parts[3].split(",");
    const latitude = parseFloat(coords[0]);
    const longitude = parseFloat(coords[1]);
    const timestamp = new Date().toISOString();

    const reportData = {
      assignedTeam: null,
      createdAt: timestamp,
      createdBy: senderNumber,
      description: description,
      location: {
        lat: latitude,
        lng: longitude
      },
      numberOfPeople: numberOfPeople,
      photo: null,
      prioLevel: 1,
      reportType: "RESCUE",
      status: "PENDING",
      remarks: [
        {
          comment: "Your report has been submitted and is now pending for review. We will get back to you as soon as possible.",
          dateRemarked: timestamp,
          status: "PENDING"
        }
      ]
    };

    // 8. Save to Firestore 
    const reportRef = db.collection("reports").doc();
    await reportRef.set(reportData);

    console.log(`Successfully processed offline report from ${senderNumber}. Doc ID: ${reportRef.id}`);
    
    return res.status(200).send("Report saved successfully");

  } catch (error) {
    console.error("Error processing SMS webhook:", error);
    return res.status(500).send("Internal Server Error");
  }
});