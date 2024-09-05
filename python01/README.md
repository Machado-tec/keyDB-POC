Here’s a `README.md` specifically for the `python01/app.py` script:

---

# Python01 KeyDB Timestamp Writer

## Overview

This script (`python01/app.py`) is part of a Proof of Concept (POC) designed to showcase a simple use case of publishing key-value pairs to a KeyDB instance. **Python01** continuously writes a timestamped value to a shared key (`shared_key`) in the KeyDB every 10 seconds. This value can then be observed by other clients to perform event-driven operations.

## Author

- **Adriano Machado**

## Functionality

The script does the following:

1. Connects to the KeyDB instance (`keydb_01`).
2. Generates a timestamp (`Python01 timestamp <epoch_time>`) every 10 seconds.
3. Stores this timestamp in the `shared_key` of KeyDB.
4. The timestamped value is then available for other Python scripts (such as **Python02** and **Python03**) to read and react to in real-time.

### Code Breakdown

```python
import time
import redis

def main():
    try:
        # Connect to the KeyDB instance (keydb_01)
        r = redis.StrictRedis(host='keydb_01', port=6379, db=0)
        
        # Continuously write a timestamp to KeyDB every 10 seconds
        while True:
            value = f"Python01 timestamp {int(time.time())}"
            r.set("shared_key", value)
            print(f"Python01 set shared_key: {value}")
            time.sleep(10)
    
    # Handle Redis connection errors
    except redis.ConnectionError as e:
        print(f"Redis connection error: {e}")
    
    # Handle unexpected errors
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    print("Starting Python01")
    main()
```

### Key Points

- **Redis Connection**: 
  - The script uses `redis-py` to connect to the `keydb_01` instance.
  
- **Timestamped Values**:
  - The value format is: `Python01 timestamp <epoch_time>`, where `<epoch_time>` is the current Unix timestamp at the time of writing.

- **Error Handling**:
  - The script has basic error handling for Redis connection failures and other unexpected issues.

### Example Output

```bash
Starting Python01
Python01 set shared_key: Python01 timestamp 1725543675
Python01 set shared_key: Python01 timestamp 1725543685
...
```

## Requirements

- **KeyDB** instance running on `keydb_01`.
- **redis-py** library installed (automatically handled by the Docker container).

## How to Run

1. Ensure KeyDB is running in a Docker container (`keydb_01`).
2. The script is executed as part of the Docker setup, but can also be run manually by navigating to the `python01` directory and executing:

   ```bash
   python app.py
   ```

## Conclusion

This script demonstrates how to publish timestamped data to KeyDB, providing a foundation for event-driven architectures or real-time data synchronization between distributed systems.

---

This `README.md` is designed to provide clear instructions and context for the purpose of the `python01/app.py` script within the larger POC project.



Author: **Adriano Machado**
