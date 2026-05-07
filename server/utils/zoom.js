// utils/zoom.js
import axios from "axios";

let accessToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const credentials = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString("base64");

  const response = await axios.post(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
    {},
    {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    }
  );

  accessToken = response.data.access_token;
  // refresh 1 minute before actual expiry
  tokenExpiry = Date.now() + response.data.expires_in * 1000 - 60000;
  return accessToken;
}

export async function createZoomMeeting(topic, startTime, duration = 60) {
  const token = await getAccessToken();

  const response = await axios.post(
    "https://api.zoom.us/v2/users/me/meetings",
    {
      topic,
      type: 2,                     // scheduled meeting
      start_time: startTime,       // ISO 8601, e.g. "2025-01-01T10:00:00Z"
      duration,
      timezone: "UTC",
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        waiting_room: true,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return {
    zoomMeetingId: response.data.id,
    joinUrl: response.data.join_url,     // for the client
    startUrl: response.data.start_url,   // for the host (nutritionist)
    password: response.data.password,
  };
}