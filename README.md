# keyDB-POC
KeyDB Docker Observable Pattern POC

# KeyDB Docker Observable Pattern POC

## Overview

This project is a Proof of Concept (POC) demonstrating two different methods of implementing the observable pattern using KeyDB as the backend to publish and listen to keyspace events. The goal is to analyze and compare the behavior of Python clients that listen for key events and react accordingly.

In this POC, **Python01** writes a shared timestamp to KeyDB, and **Python02** and **Python03** listen for changes to the `shared_key`. Both Python02 and Python03 calculate the time difference between the write and their reads, while performing a handshake operation as a response.

## Key Components

1. **KeyDB Master-Replica Cluster**:
   - A KeyDB cluster is set up with one master (`keydb_01`) and two replicas (`keydb_02` and `keydb_03`).
   - Each KeyDB instance is running in **active-replica** mode, allowing for seamless synchronization across instances.
   - Keyspace notifications are enabled, allowing Python clients to subscribe and react to key changes.

2. **Python Clients**:
   - **Python01** writes a timestamped value to the `shared_key` every 10 seconds.
   - **Python02** listens for `shared_key` changes, reads the value, and calculates the time difference between the write and read events.
   - **Python03** performs the same functionality asynchronously, using `aioredis` to handle the observable pattern.

## Project Structure

```bash
.
├── docker-compose.yaml        # Docker Compose file to set up KeyDB and Python services
├── python01
│   └── app.py                 # Python script that writes timestamps to KeyDB
├── python02
│   └── app.py                 # Python script that listens for changes and calculates time difference (sync)
└── python03
    └── app.py                 # Python script that listens for changes and calculates time difference (async)
```

## Requirements

- Docker and Docker Compose
- Python 3.9 or above (for local development without Docker)

## Setup

1. Clone the repository:

   ```bash
   git clone git@github.com:Machado-tec/keyDB-POC.git
   cd keyDB-POC
   ```

2. Build and start the services using Docker Compose:

   ```bash
   docker compose up --build
   ```

3. This will spin up three KeyDB instances (`keydb_01`, `keydb_02`, `keydb_03`) and three Python clients (`python01`, `python02`, `python03`).

4. **Python01** will write the current timestamp to the KeyDB every 10 seconds, while **Python02** and **Python03** will react to these changes, compute the time difference, and log handshake responses.

## Key Points of Interest

- **Observable Pattern**:
  - The observable pattern is used in **Python02** and **Python03**, where both scripts subscribe to keyspace notifications (`__keyevent@0__:set`) and react to changes to `shared_key`.
  
- **Time Difference Calculation**:
  - Upon reading `shared_key`, both clients compute the time difference between the moment the key was written (by **Python01**) and when it was read (by **Python02** and **Python03**).

- **Synchronous vs Asynchronous**:
  - **Python02** demonstrates synchronous handling of keyspace events, using traditional `redis-py`.
  - **Python03** demonstrates asynchronous handling using `aioredis`.

## Example Output

**Python01**:
```bash
Starting Python01
Python01 set shared_key: Python01 timestamp 1725543675
```

**Python02**:
```bash
Python02 read shared_key: Python01 timestamp 1725543675, Time difference: 2 seconds
Set handshake_key: Handshake triggered by key event
```

**Python03**:
```bash
Python03 read shared_key: Python01 timestamp 1725543675, Time difference: 3 seconds
Python03 set handshake_key: Handshake from Python03
```

## Conclusion

This project demonstrates the flexibility of using KeyDB for event-driven systems through keyspace notifications. It also highlights the differences between synchronous and asynchronous implementations of the observable pattern in Python.

## Author

This POC was developed by **Adriano Machado** to explore the practical applications of the observable pattern using KeyDB and Python.

