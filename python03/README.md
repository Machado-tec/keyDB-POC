Here’s a `README.md` for the `python03/app.py` script:

---

# Python03 KeyDB Asynchronous Reader

## Overview

This script (`python03/app.py`) is part of a Proof of Concept (POC) for an event-driven architecture using KeyDB, demonstrating **asynchronous** data access with `aioredis`. **Python03** asynchronously reads the value of `shared_key` from KeyDB, calculates the time difference between when the key was written and when it was read, and performs a handshake operation to acknowledge the event.

## Author

- **Adriano Machado**

## Functionality

The script performs the following:

1. **Reads the value of `shared_key` asynchronously** from KeyDB.
2. Extracts the timestamp from the key’s value and calculates the **time difference** between when the key was set (by Python01) and when it was read (by Python03).
3. Performs a **handshake operation** by writing a new value (`handshake_key`) back to KeyDB to confirm the event was processed.

### Code Breakdown

```python
import asyncio
import aioredis
import time

async def main():
    redis = await aioredis.create_redis('redis://keydb_03')
    res = await redis.get('shared_key')
    if res:
        # Extract the timestamp from shared_key and calculate the difference
        key_value = res.decode('utf-8')
        timestamp_str = key_value.split()[-1]
        written_time = int(timestamp_str)
        current_time = int(time.time())
        time_difference = current_time - written_time
        print(f"Python03 read shared_key: {key_value}, Time difference: {time_difference} seconds")

        # Perform handshake operation
        handshake_value = f"Handshake from Python03"
        await redis.set("handshake_key", handshake_value)
        print(f"Python03 set handshake_key: {handshake_value}")

    redis.close()
    await redis.wait_closed()

asyncio.run(main())
```

### Key Points

- **Asynchronous Data Access**: 
  - The script uses `aioredis` to asynchronously connect to KeyDB and read the value of `shared_key`, allowing non-blocking operations for better performance, especially in high-load environments.
  
- **Timestamp Comparison**:
  - Once the key is read, the script extracts the timestamp and compares it to the current time to calculate the time difference between the key’s creation and the read operation.
  
- **Handshake Mechanism**:
  - After processing the key, **Python03** writes a `handshake_key` to KeyDB, signaling the completion of the event handling process.

### Example Output

```bash
Python03 read shared_key: Python01 timestamp 1725543675, Time difference: 2 seconds
Python03 set handshake_key: Handshake from Python03
```

## Requirements

- **KeyDB** instance running on `keydb_03`.
- **aioredis** library for asynchronous Redis operations (automatically installed by the Docker container).

## How to Run

1. Ensure KeyDB is running in a Docker container (`keydb_03`).
2. The script is executed as part of the Docker setup, but can also be run manually by navigating to the `python03` directory and executing:

   ```bash
   python app.py
   ```

## Conclusion

This script showcases the use of asynchronous programming with KeyDB using `aioredis`, making it suitable for scalable and high-performance event-driven systems where multiple operations need to be handled concurrently without blocking.

--- 

This `README.md` focuses on explaining the asynchronous approach used in `python03/app.py` and its key role in the POC project.