Here’s a `README.md` for the `python02/app.py` script:

---

# Python02 KeyDB Event Listener

## Overview

This script (`python02/app.py`) is part of a Proof of Concept (POC) for implementing event-driven architecture using **KeyDB's keyspace notification** system. **Python02** listens for events triggered when the `shared_key` is updated in KeyDB, processes these events, and calculates the time difference between the key's creation and when it is read.

## Author

- **Adriano Machado**

## Functionality

The script performs the following:

1. **Subscribes to KeyDB keyspace notifications** for the `shared_key`.
2. When an event occurs (a new value is set on `shared_key`), it:
   - Retrieves the current value of `shared_key`.
   - Extracts the timestamp from the value.
   - Calculates the time difference between the moment the key was written and the moment it was read.
3. After processing, it performs a **handshake operation** by writing a new value (`handshake_key`) back to KeyDB to acknowledge the event.

### Code Breakdown

```python
import redis
import time

class KeyEventObserver:
    def __init__(self, host, port, db):
        self.redis_client = redis.StrictRedis(host=host, port=port, db=db)
        self.pubsub = self.redis_client.pubsub()
        # Subscribe to key space notifications for any 'set' event
        self.pubsub.psubscribe('__keyevent@0__:set')

    def handle_event(self, message):
        if message['type'] == 'pmessage':
            key = message['data'].decode('utf-8')
            if key == 'shared_key':  # Only process shared_key events
                shared_value = self.redis_client.get("shared_key")
                if shared_value:
                    # Extract timestamp and calculate time difference
                    timestamp_str = shared_value.decode('utf-8').split()[-1]
                    written_time = int(timestamp_str)
                    current_time = int(time.time())
                    time_difference = current_time - written_time
                    print(f"Python02 read shared_key: {shared_value.decode('utf-8')}, "
                          f"Time difference: {time_difference} seconds")
                    
                    # Set handshake_key to confirm event processing
                    handshake_value = f"Handshake triggered by key event"
                    self.redis_client.set("handshake_key", handshake_value)
                    print(f"Set handshake_key: {handshake_value}")

    def listen(self):
        print("Listening for key events...")
        for message in self.pubsub.listen():
            self.handle_event(message)

if __name__ == "__main__":
    observer = KeyEventObserver(host='keydb_02', port=6379, db=0)
    observer.listen()
```

### Key Points

- **Event Subscription**: 
  - The script subscribes to KeyDB's `__keyevent@0__:set` channel, which triggers events whenever a key is set in the KeyDB instance.
  
- **Timestamp Processing**: 
  - The script calculates the time difference between when the key was written by **Python01** and when it is read by **Python02**.
  
- **Handshake Mechanism**:
  - Once the key is processed, **Python02** writes back a `handshake_key` to KeyDB, which can serve as an acknowledgment for the event.

### Example Output

```bash
Listening for key events...
Python02 read shared_key: Python01 timestamp 1725543675, Time difference: 2 seconds
Set handshake_key: Handshake triggered by key event
```

## Requirements

- **KeyDB** instance running on `keydb_02`.
- **redis-py** library installed (automatically handled by the Docker container).

## How to Run

1. Ensure KeyDB is running in a Docker container (`keydb_02`).
2. The script is executed as part of the Docker setup, but can also be run manually by navigating to the `python02` directory and executing:

   ```bash
   python app.py
   ```

## Conclusion

This script demonstrates how to listen for keyspace notifications in KeyDB, making it suitable for event-driven architectures where the system reacts to key changes in real-time.

---

This `README.md` focuses on explaining the key features and use cases of the `python02/app.py` script in the larger POC project.


Author: **Adriano Machado**
