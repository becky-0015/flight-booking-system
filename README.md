
### Flight Booking System Documentation

#### Overview

This Flight Booking System is implemented in TypeScript using the Azle library. It provides functionalities to manage flight bookings, including adding, updating, deleting, searching, and retrieving flight bookings.

#### Dependencies

- Azle library (`'azle'`): Azle is a library used for building decentralized applications (dApps) on the Internet Computer.

- UUID library (`'uuid'`): Used for generating unique identifiers for flight bookings.

#### Types

##### `FlightBooking`

A record type representing the structure of a flight booking:

- `id`: Unique identifier for the booking.
- `airline`: Airline name.
- `departureAirport`: Departure airport code.
- `arrivalAirport`: Arrival airport code.
- `departureTime`: Departure time represented as a 64-bit natural number (`nat64`).
- `arrivalTime`: Arrival time represented as a 64-bit natural number (`nat64`).
- `createdAt`: Timestamp representing the creation time.
- `updatedAt`: Optional timestamp representing the last update time.

##### `FlightBookingPayload`

A record type representing the payload used for creating or updating a flight booking. It excludes the `id`, `createdAt`, and `updatedAt` fields.

#### Functions

##### `getFlightBookings`

- **Description**: Retrieve all flight bookings.

- **Return Type**: `Result<Vec<FlightBooking>, string>` - A result containing a vector of flight bookings or an error message.

##### `getFlightBooking`

- **Description**: Retrieve a specific flight booking by ID.

- **Parameters**: `id` - The ID of the flight booking to retrieve.

- **Return Type**: `Result<FlightBooking, string>` - A result containing the requested flight booking or an error message.

##### `addFlightBooking`

- **Description**: Add a new flight booking.

- **Parameters**: `payload` - The payload containing flight booking details.

- **Return Type**: `Result<FlightBooking, string>` - A result containing the newly added flight booking or an error message.

##### `updateFlightBooking`

- **Description**: Update an existing flight booking by ID.

- **Parameters**: `id` - The ID of the flight booking to update. `payload` - The payload containing updated flight booking details.

- **Return Type**: `Result<FlightBooking, string>` - A result containing the updated flight booking or an error message.

##### `deleteFlightBooking`

- **Description**: Delete a flight booking by ID.

- **Parameters**: `id` - The ID of the flight booking to delete.

- **Return Type**: `Result<FlightBooking, string>` - A result containing the deleted flight booking or an error message.

##### `searchFlightBookings`

- **Description**: Search for flight bookings based on a keyword in airline names.

- **Parameters**: `keyword` - The keyword to search for.

- **Return Type**: `Result<Vec<FlightBooking>, string>` - A result containing a vector of filtered flight bookings or an error message.

##### `countFlightBookings`

- **Description**: Count the total number of flight bookings.

- **Return Type**: `Result<number, string>` - A result containing the count of flight bookings or an error message.

##### `getFlightBookingsPaginated`

- **Description**: Get a paginated list of flight bookings.

- **Parameters**: `page` - The page number. `pageSize` - The number of items per page.

- **Return Type**: `Result<Vec<FlightBooking>, string>` - A result containing a vector of paginated flight bookings or an error message.

##### `getFlightBookingsByTimeRange`

- **Description**: Get flight bookings within a specific time range.

- **Parameters**: `startTime` - The start time of the range. `endTime` - The end time of the range.

- **Return Type**: `Result<Vec<FlightBooking>, string>` - A result containing a vector of filtered flight bookings or an error message.

#### Deployment

1. **Installation**

    Ensure you have Node.js and npm installed. Run the following command to install dependencies:

    ```bash
    npm install
    ```

2. **Run on the Internet Computer**

 ```bash
    dfx start
    ```
    
    ```bash
    dfx deploy
    ```

3. **Accessing the Service**

    After a successful deployment, you will receive URLs to interact with your canisters. Use these URLs to access the flight booking service.
