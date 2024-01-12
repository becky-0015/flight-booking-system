import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt } from 'azle';
import { v4 as uuidv4 } from 'uuid';

// Define the type for a flight booking
type FlightBooking = Record<{
    id: string;
    airline: string;
    departureAirport: string;
    arrivalAirport: string;
    departureTime: nat64;
    arrivalTime: nat64;
    createdAt: nat64;
    updatedAt: Opt<nat64>;
}>

// Define the type for the payload used in creating or updating a flight booking
type FlightBookingPayload = Record<{
    airline: string;
    departureAirport: string;
    arrivalAirport: string;
    departureTime: nat64;
    arrivalTime: nat64;
}>

// Create a storage for flight bookings
const flightBookingStorage = new StableBTreeMap<string, FlightBooking>(0, 44, 1024);

/**
 * Get all flight bookings.
 * @returns Result<Vec<FlightBooking>, string> - A Result containing a Vec of flight bookings or an error message.
 */
$query;
export function getFlightBookings(): Result<Vec<FlightBooking>, string> {
    try {
        return Result.Ok(flightBookingStorage.values());
    } catch (error: unknown) {
        return Result.Err<Vec<FlightBooking>, string>(`Error getting flight bookings: ${(error as Error).message}`);
    }
}

/**
 * Get a specific flight booking by ID.
 * @param id - The ID of the flight booking to retrieve.
 * @returns Result<FlightBooking, string> - A Result containing the requested flight booking or an error message.
 */
$query;
export function getFlightBooking(id: string): Result<FlightBooking, string> {
    try {
        return match(flightBookingStorage.get(id), {
            Some: (flightBooking) => Result.Ok<FlightBooking, string>(flightBooking),
            None: () => Result.Err<FlightBooking, string>(`A flight booking with id=${id} not found`)
        });
    } catch (error: unknown) {
        return Result.Err<FlightBooking, string>(`Error getting flight booking: ${(error as Error).message}`);
    }
}

/**
 * Add a new flight booking.
 * @param payload - The payload containing flight booking details.
 * @returns Result<FlightBooking, string> - A Result containing the newly added flight booking or an error message.
 */
$update;
export function addFlightBooking(payload: FlightBookingPayload): Result<FlightBooking, string> {
    try {
        // Validate input
        if (!payload.airline || !payload.departureAirport || !payload.arrivalAirport || !payload.departureTime || !payload.arrivalTime) {
            return Result.Err<FlightBooking, string>('Invalid input. Please provide all required fields.');
        }

        // Validate time range
        if (payload.departureTime >= payload.arrivalTime) {
            return Result.Err<FlightBooking, string>('Arrival time must be after the departure time.');
        }

        // Create and insert the flight booking
        const flightBooking: FlightBooking = {
            id: uuidv4(),
            createdAt: ic.time(),
            updatedAt: Opt.None,
            ...payload
        };
        flightBookingStorage.insert(flightBooking.id, flightBooking);

        return Result.Ok(flightBooking);
    } catch (error: unknown) {
        return Result.Err<FlightBooking, string>(`Error adding flight booking: ${(error as Error).message}`);
    }
}

/**
 * Update an existing flight booking by ID.
 * @param id - The ID of the flight booking to update.
 * @param payload - The payload containing updated flight booking details.
 * @returns Result<FlightBooking, string> - A Result containing the updated flight booking or an error message.
 */
$update;
export function updateFlightBooking(id: string, payload: FlightBookingPayload): Result<FlightBooking, string> {
    try {
        // Validate input
        if (!payload.airline || !payload.departureAirport || !payload.arrivalAirport || !payload.departureTime || !payload.arrivalTime) {
            return Result.Err<FlightBooking, string>('Invalid input. Please provide all required fields.');
        }

        // Validate time range
        if (payload.departureTime >= payload.arrivalTime) {
            return Result.Err<FlightBooking, string>('Arrival time must be after the departure time.');
        }

        // Update the flight booking
        return match(flightBookingStorage.get(id), {
            Some: (flightBooking) => {
                const updatedFlightBooking: FlightBooking = {
                    ...flightBooking,
                    ...payload,
                    updatedAt: Opt.Some(ic.time())
                };
                flightBookingStorage.insert(flightBooking.id, updatedFlightBooking);
                return Result.Ok<FlightBooking, string>(updatedFlightBooking);
            },
            None: () => Result.Err<FlightBooking, string>(`Couldn't update a flight booking with id=${id}. Flight booking not found`)
        });
    } catch (error: unknown) {
        return Result.Err<FlightBooking, string>(`Error updating flight booking: ${(error as Error).message}`);
    }
}

/**
 * Delete a flight booking by ID.
 * @param id - The ID of the flight booking to delete.
 * @returns Result<FlightBooking, string> - A Result containing the deleted flight booking or an error message.
 */
$update;
export function deleteFlightBooking(id: string): Result<FlightBooking, string> {
    try {
        return match(flightBookingStorage.remove(id), {
            Some: (deletedFlightBooking) => Result.Ok<FlightBooking, string>(deletedFlightBooking),
            None: () => Result.Err<FlightBooking, string>(`Couldn't delete a flight booking with id=${id}. Flight booking not found.`)
        });
    } catch (error: unknown) {
        return Result.Err<FlightBooking, string>(`Error deleting flight booking: ${(error as Error).message}`);
    }
}

/**
 * Search for flight bookings based on a keyword.
 * @param keyword - The keyword to search for in airline names.
 * @returns Result<Vec<FlightBooking>, string> - A Result containing a Vec of filtered flight bookings or an error message.
 */
$query;
export function searchFlightBookings(keyword: string): Result<Vec<FlightBooking>, string> {
    try {
        const filteredBookings = flightBookingStorage
            .values()
            .filter((booking) =>
                booking.airline.toLowerCase().includes(keyword.toLowerCase())
            );

        return Result.Ok(filteredBookings);
    } catch (error: unknown) {
        return Result.Err<Vec<FlightBooking>, string>(`Error searching flight bookings: ${(error as Error).message}`);
    }
}

/**
 * Count the total number of flight bookings.
 * @returns Result<number, string> - A Result containing the count of flight bookings or an error message.
 */
$query;
export function countFlightBookings(): Result<number, string> {
    try {
        const count = flightBookingStorage.len();

        // Convert the bigint to number
        const countAsNumber = Number(count);

        return Result.Ok(countAsNumber);
    } catch (error: unknown) {
        return Result.Err<number, string>(`Error counting flight bookings: ${(error as Error).message}`);
    }
}

/**
 * Get a paginated list of flight bookings.
 * @param page - The page number.
 * @param pageSize - The number of items per page.
 * @returns Result<Vec<FlightBooking>, string> - A Result containing a Vec of paginated flight bookings or an error message.
 */
$query;
export function getFlightBookingsPaginated(page: number, pageSize: number): Result<Vec<FlightBooking>, string> {
    try {
        const startIdx = (page - 1) * pageSize;
        const paginatedBookings = flightBookingStorage.values().slice(startIdx, startIdx + pageSize);

        return Result.Ok(paginatedBookings);
    } catch (error: unknown) {
        return Result.Err<Vec<FlightBooking>, string>(`Error getting paginated flight bookings: ${(error as Error).message}`);
    }
}

/**
 * Get flight bookings within a specific time range.
 * @param startTime - The start time of the range.
 * @param endTime - The end time of the range.
 * @returns Result<Vec<FlightBooking>, string> - A Result containing a Vec of filtered flight bookings or an error message.
 */
$query;
export function getFlightBookingsByTimeRange(startTime: nat64, endTime: nat64): Result<Vec<FlightBooking>, string> {
    try {
        const filteredBookings = flightBookingStorage
            .values()
            .filter((booking) => booking.departureTime >= startTime && booking.arrivalTime <= endTime);

        return Result.Ok(filteredBookings);
    } catch (error: unknown) {
        return Result.Err<Vec<FlightBooking>, string>(`Error getting flight bookings by time range: ${(error as Error).message}`);
    }
}

// Workaround to make uuid package work with Azle
globalThis.crypto = {
    // @ts-ignore
    getRandomValues: () => {
        let array = new Uint8Array(32);

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    }
};
