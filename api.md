  *WebSocket*
  The WebSocket connection is established using a JWT access token passed as a query parameter. This enables secure, real-time communication for ride-related actions. Implement automatic reconnection logic to handle network interruptions. The server sends periodic heartbeat messages to maintain the connection, ensuring reliability during long sessions.


const accessToken = "your_jwt_access_token";
const endpoint = `ws://localhost:8000/ride/service?token=${encodeURIComponent(accessToken)}`;
const socket = new WebSocket(endpoint);

socket.onopen = () => console.log('WebSocket connected.');
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Response:', data);
  if (data.message === 'Heartbeat received') {
    console.log('Heartbeat:', data.timestamp);
  }
};
socket.onerror = (error) => console.error('Error:', error);
socket.onclose = () => console.log('WebSocket closed.');
      

Heartbeat Example: The server sends periodic heartbeats to confirm the connection is active. Example payload:


{
  "data": { "timestamp": "2025-05-27T13:07:00Z" },
  "message": "Heartbeat received"
}
      

Tip: Use the WebSocketManager class (see Frontend Integration) for simplified connection management, including reconnection logic and heartbeat handling.

*Monitoring*
 The Staff Monitoring WebSocket (/ride/monitor) provides real‑time visibility into active rides, passenger ride requests, and driver status. It also allows staff to manually match any searching passenger with any online driver – bypassing normal proximity/eligibility rules. All actions are restricted to authenticated staff users.

Connection URL: wss://your-domain/ride/monitor
Authentication: Requires a valid session cookie or token that identifies a staff user (user.is_staff = True).
No ride_id required – the connection receives updates for all rides and passenger searches automatically.
Server → Client Message Types

The server sends the following JSON structures to the staff client. The client should listen for the type field to handle each update.
passenger_request

A passenger has started searching for a ride. Contains full journey details.

{
  "type": "passenger_request",
  "passenger_id": "uuid",
  "pickup": { "lat": 9.056265, "lng": 7.498526 },
  "destination": { "lat": 9.04215, "lng": 7.314292 },
  "service_type": "standard",   // "standard", "shared", "dispatch", "luxury"
  "option": "instant",          // "instant" or "schedule"
  "estimated_price": { "amount": 2500, "currency": "NGN" },
  "bargain_amount": { "amount": 2000, "currency": "NGN" } | null,
  "timestamp": "2025-08-16T18:26:00Z"
}

ride_update (location)

Real‑time location update from a driver in an active ride.

{
  "type": "ride_update",
  "ride_id": "uuid",
  "update_type": "location",
  "location": { "lat": 9.056265, "lng": 7.498526 },
  "timestamp": "2025-08-16T18:26:00Z"
}

ride_update (status)

Ride status or participant progress changed (e.g., started, completed, cancelled).

{
  "type": "ride_update",
  "ride_id": "uuid",
  "update_type": "status",
  "status": "ACTIVE",          // RideStatus: MATCHED, ACTIVE, COMPLETED, CANCEL
  "progress": "ONGOING",       // RideProgress (optional)
  "message": "Ride started",
  "timestamp": "2025-08-16T18:26:00Z"
}

drivers_list

Response to list_drivers action. Lists all online drivers with their current location.

{
  "type": "drivers_list",
  "drivers": [
    {
      "driver_id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "phone_number": "+234...",
      "driver_type": 1,          // 1 = Driver, 2 = Dispatch Rider
      "rating": "4.8",
      "current_location": { "lat": 9.056265, "lng": 7.498526 },
      "plate_number": "ABC-1234"
    }
  ]
}

passengers_list

Response to list_passengers action. Lists all passengers currently searching for a ride.

{
  "type": "passengers_list",
  "passengers": [
    {
      "passenger_id": "uuid",
      "journey": {
        "pickup": { "lat": 9.056265, "lng": 7.498526 },
        "destination": { "lat": 9.04215, "lng": 7.314292 },
        "service_type": "standard",
        "option": "instant",
        "estimated_price": { "amount": 2500, "currency": "NGN" }
      },
      "state": "searching"
    }
  ]
}

manual_match_success

Confirmation after staff successfully matched a passenger with a driver manually.

{
  "type": "manual_match_success",
  "passenger_id": "uuid",
  "driver_id": "uuid",
  "ride_data": { ... }   // full journey data + driver info
}

Utility Responses

connected – Sent immediately after connection.
pong – Reply to a client ping action.
pending_refreshed – Confirmation after refresh_pending.
error – Used for any failure (authentication, invalid action, manual match error).
Client → Server Actions (Staff Commands)

The staff client can send JSON objects with an action field to request data or perform manual matching.
1. list_passengers

Description

Retrieve a list of all passengers currently in the “searching” state (active ride requests).

Parameters

    None

Response

passengers_list (see above).

{ "action": "list_passengers" }

Sample Usage

ws.send(JSON.stringify({ action: "list_passengers" }));

2. list_drivers

Description

Retrieve a list of all drivers who are currently online (presence key active) and their last known location.

Parameters

    None

Response

drivers_list.

{ "action": "list_drivers" }

Sample Usage

ws.send(JSON.stringify({ action: "list_drivers" }));

3. manual_match

Description

Forces a match request to be sent from a searching passenger to any online driver, bypassing normal proximity, capacity, and service type checks. The driver receives a new_match notification (same as a regular match opportunity) and can choose to accept or reject. If accepted, the passenger must then approve the request (via approve_match_request) to create the ride.

Parameters

    passenger_id: String (UUID) – the passenger’s ID.
    driver_id: String (UUID) – the driver’s ID.
    proposed_fare: Float (optional) – overrides the passenger’s price.

Response

manual_match_sent on success, or error.

{
"action": "manual_match",
"passenger_id": "uuid",
"driver_id": "uuid",
"proposed_fare": 3000.00
}

Sample Usage

ws.send(JSON.stringify({
  action: "manual_match",
  passenger_id: "abc-123",
  driver_id: "def-456",
  proposed_fare: 3500
}));

Important: Manual match bypasses all driver eligibility checks (proximity, capacity, service type compatibility) except driver online status. The ride is created immediately and both parties are notified via their existing WebSocket connections.
4. refresh_pending

Description

Force a resynchronisation of the pending passenger list from Redis. Useful after manual matching or when passive updates are delayed.

Parameters

    None

Response

pending_refreshed with the new count.

{ "action": "refresh_pending" }

5. ping

Description

Keep‑alive request. Server replies with pong containing the same timestamp.

Parameters

    timestamp: String (ISO format) – optional, echoed back.

{ "action": "ping", "timestamp": "2025-08-16T18:26:00Z" }

Note: All actions require an authenticated staff WebSocket connection. The server will close the connection if authentication fails or if a non‑staff user attempts to connect.
