import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt } from 'azle';
import { v4 as uuidv4 } from 'uuid';

type FlightBooking = Record<{
    id: string;
    airline: string;
    departureAirport: string;
    arrivalAirport: string;
    departureTime: nat64;
    arrivalTime: nat64;
    createdAt: nat64;
    updatedAt: Opt<nat64>;
}>;

type FlightBookingPayload = Record<{
    airline: string;
    departureAirport: string;
    arrivalAirport: string;
    departureTime: nat64;
    arrivalTime: nat64;
}>;

const flightBookingStorage = new StableBTreeMap<string, FlightBooking>(0, 44, 1024);

$query;
export function getFlightBookings(): Result<Vec<FlightBooking>, string> {
    try {
        return Result.Ok(flightBookingStorage.values());
    } catch (error: unknown) {
        return Result.Err<Vec<FlightBooking>, string>(`Error getting flight bookings: ${(error as Error).message}`);
    }
}

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

$update;
export function addFlightBooking(payload: FlightBookingPayload): Result<FlightBooking, string> {
    try {
        if (!payload.airline || !payload.departureAirport || !payload.arrivalAirport || !payload.departureTime || !payload.arrivalTime) {
            return Result.Err<FlightBooking, string>('Invalid input. Please provide all required fields.');
        }

        if (payload.departureTime >= payload.arrivalTime) {
            return Result.Err<FlightBooking, string>('Arrival time must be after the departure time.');
        }

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

$update;
export function updateFlightBooking(id: string, payload: FlightBookingPayload): Result<FlightBooking, string> {
    try {
        if (!payload.airline || !payload.departureAirport || !payload.arrivalAirport || !payload.departureTime || !payload.arrivalTime) {
            return Result.Err<FlightBooking, string>('Invalid input. Please provide all required fields.');
        }

        if (payload.departureTime >= payload.arrivalTime) {
            return Result.Err<FlightBooking, string>('Arrival time must be after the departure time.');
        }

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

$update;
export function deleteEntity(id: string, storage: StableBTreeMap<string, any>): Result<FlightBooking, string> {
    try {
        return match(storage.remove(id), {
            Some: (deletedEntity) => Result.Ok<FlightBooking, string>(deletedEntity),
            None: () => Result.Err<FlightBooking, string>(`Couldn't delete an entity with id=${id}. Entity not found.`)
        });
    } catch (error: unknown) {
        return Result.Err<FlightBooking, string>(`Error deleting entity: ${(error as Error).message}`);
    }
}

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
