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

  // Verify Authorization Header
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

    // Format from frontend: SOS|[INCIDENT_TYPE]-[CONTACT_NAME]|[NUMBER_OF_PEOPLE]|[DETAIL_1,DETAIL_2,DETAIL_3]|[LATITUDE,LONGITUDE]
    const parts = messageContent.split("|");
    
    if (parts.length < 5) {
      console.warn("Malformed SOS message format:", messageContent);
      return res.status(400).send("Malformed message format");
    }

    // Parse Name & Incident Type
    const typeAndName = parts[1];
    const splitIndex = typeAndName.indexOf("-");
    const incidentType = splitIndex !== -1 ? typeAndName.substring(0, splitIndex) : "UNKNOWN";
    const contactName = splitIndex !== -1 ? typeAndName.substring(splitIndex + 1) : typeAndName;

    // Parse People Range to a Number
    const peopleRange = parts[2]; 
    let parsedPeopleNumber = 1;

    if (peopleRange.includes("-")) {
      parsedPeopleNumber = parseInt(peopleRange.split("-")[1], 10);
    } else if (peopleRange.includes("+")) {
      parsedPeopleNumber = parseInt(peopleRange.replace("+", ""), 10);
    } else {
      parsedPeopleNumber = parseInt(peopleRange, 10) || 1;
    }

    // Parse and Format Details
    const detailsArray = parts[3].split(",");
    const formattedDetails = detailsArray.map(detail => `• ${detail}`).join("\n");
    const description = `Incident: ${incidentType}\nContact Person: ${contactName}\nReported People: ${peopleRange}\n\nSpecific Details:\n${formattedDetails}`;

    // Parse Coordinates
    const coords = parts[4].split(",");
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
      numberOfPeople: parsedPeopleNumber, 
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

    const reportRef = db.collection("reports").doc();
    await reportRef.set(reportData);

    console.log(`Successfully processed offline report from ${senderNumber}. Doc ID: ${reportRef.id}`);
    
    // Schedule Auto-Reply via HttpSms
    const httpsmsApiKey = "uk_r393DYZ2veupx6jwBK_IKSv131n5HTvRTL9i7MFl9JyLI8QZ7IbZS279yKvOcqyx"; 
    const systemPhoneNumber = "+639608029319"; 
    
    // 1 min
    const scheduleTime = new Date(Date.now() + 30000); 

    try {
      const dispatchReply = `SOS RECEIVED 

INCIDENT: ${incidentType.toUpperCase()}
CONTACT: ${contactName.toUpperCase()}
STATUS: LOGGED

Your coordinates and emergency details have been successfully received by the system.

**DISCLAIMER: This is only a test message**`;

      // Send via HttpSms
      const smsResponse = await fetch("https://api.httpsms.com/v1/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": httpsmsApiKey
        },
        body: JSON.stringify({
          from: systemPhoneNumber,
          to: senderNumber,
          content: dispatchReply,
          send_at: scheduleTime.toISOString() 
        })
      });

      if (!smsResponse.ok) {
        const errorText = await smsResponse.text();
        console.error("Failed to schedule auto-reply via HttpSms:", errorText);
      } else {
        console.log(`Auto-reply scheduled successfully for ${senderNumber} at ${scheduleTime.toISOString()}`);
      }
    } catch (smsError) {
      console.error("Network error while trying to reach HttpSms API:", smsError);
    }
    
    return res.status(200).send("Report saved and auto-reply scheduled successfully");
  } catch (error) {
    console.error("Error processing SMS webhook:", error);
    return res.status(500).send("Internal Server Error");
  }
});