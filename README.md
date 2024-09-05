# KeyDB-POC: KeyDB Docker Observable Pattern POC

## Table of Contents
1. [README](#readme)
2. [Final Report: Evaluation of KeyDB and Observer Pattern for Event-Driven Architecture](#final-report)
3. [Considerations for Testing and Validation of the POC in a Real Environment](#considerations-for-testing)

---

## README

### KeyDB Docker Observable Pattern POC

### Overview
This project is a Proof of Concept (POC) demonstrating two different methods of implementing the **Observer Pattern** using **KeyDB** as the backend to publish and listen to keyspace events. The objective is to analyze and compare the behavior of Python clients that listen for key events and react accordingly.

In this POC, **Python01** writes a shared timestamp to KeyDB, while **Python02** and **Python03** listen for changes to the `shared_key`. Both Python02 and Python03 calculate the time difference between the write and their reads while performing a handshake operation as a response.

### Key Components
1. **KeyDB Master-Replica Cluster**:
   - A KeyDB cluster with one master (`keydb_01`) and two replicas (`keydb_02` and `keydb_03`).
   - Active-replica mode is enabled for seamless synchronization across instances.
   - Keyspace notifications are enabled for Python clients to subscribe and react to key changes.

2. **Python Clients**:
   - **Python01** writes a timestamped value to `shared_key` every 10 seconds.
   - **Python02** listens for `shared_key` changes, reads the value, and calculates the time difference.
   - **Python03** performs the same functionality asynchronously, using `aioredis`.

### Project Structure
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

### Setup
1. Clone the repository:
   ```bash
   git clone git@github.com:Machado-tec/keyDB-POC.git
   cd keyDB-POC
   ```

2. Build and start the services using Docker Compose:
   ```bash
   docker compose up --build
   ```

### Example Output
**Python01**:
```bash
Python01 set shared_key: Python01 timestamp 1725543675
```

**Python02**:
```bash
Python02 read shared_key: Python01 timestamp 1725543675, Time difference: 2 seconds
```

**Python03**:
```bash
Python03 read shared_key: Python01 timestamp 1725543675, Time difference: 3 seconds
```

### Conclusion
This POC showcases the flexibility of KeyDB for event-driven systems through keyspace notifications. It also highlights the differences between synchronous and asynchronous implementations of the Observer Pattern.

Author: **Adriano Machado**

---

## Final Report: Evaluation of KeyDB and Observer Pattern for Event-Driven Architecture

### Introduction
This POC explores **KeyDB** as a high-performance alternative to **Redis**, focusing on its **multi-master replication** capabilities and its use in an event-driven architecture. We evaluated two implementations of the **Observer Pattern** to track shared data changes using KeyDB's keyspace notification system.

### KeyDB vs. Redis: A Performance Perspective

**KeyDB** introduces several performance optimizations:
1. **Multi-Master Replication**: Allows multiple nodes to accept writes simultaneously, improving availability and fault tolerance.
2. **Multi-threaded Execution**: Unlike Redis’s single-threaded model, KeyDB leverages multi-threading for better performance.
3. **Full Compatibility with Redis**: KeyDB can be a drop-in replacement for Redis.

**Performance Gains**:
- **KeyDB's multi-master replication** allows for concurrent write operations without data inconsistency.
- The multi-threaded nature resulted in lower latency, especially under high traffic.

### Observer Pattern Implementations

#### 1. Synchronous Event Listener (Python02)
- Uses Redis Pub/Sub to listen for key changes synchronously.
- Blocks while waiting for notifications, making it simpler but less scalable.

#### 2. Asynchronous Event Listener (Python03)
- Uses `aioredis` to handle key changes asynchronously.
- Non-blocking, making it more suitable for large-scale, real-time applications.

**Comparative Analysis**:
- **Python02** is easier to implement but less scalable.
- **Python03** is more scalable, handling higher loads and improving response times.

### Conclusion
**KeyDB** proves to be a robust alternative to Redis for event-driven systems, providing scalability, performance, and availability advantages. The asynchronous Observer Pattern is especially suitable for real-time, large-scale systems.

---

## Considerations for Testing and Validation of the POC in a Real Environment

### Introduction
After successfully implementing this POC, it’s essential to validate the system in real-world conditions. The following considerations outline hardware, network configurations, and testing methods to ensure accurate performance assessments.

### Hardware Considerations
1. **Raspberry Pi Setup**:
   - Test on Raspberry Pi 4B for lightweight KeyDB clusters. Use active cooling to prevent overheating and SSDs for fast read/write performance.
   
2. **PC Setup**:
   - For large-scale testing, use PCs with multi-core processors (Intel Core i5 or higher) and SSDs for improved performance.

### Network Considerations
1. **Gigabit Ethernet**:
   - Use Gigabit Ethernet networks to avoid bandwidth bottlenecks. Low-latency networks are crucial for real-time event-driven behavior.

2. **Network Configuration**:
   - Dedicate an internal network for KeyDB communication and monitor performance using tools like Wireshark or Prometheus.

### Validation Strategies

1. **Performance Testing**:
   - Use tools like Apache JMeter or Redis-benchmark to simulate high loads.
   - Perform real-time monitoring of time differences between Python02 and Python03 across various setups.

2. **Scalability Testing**:
   - Add more KeyDB nodes and simulate real-world client loads to validate scalability and responsiveness.

3. **High Availability Testing**:
   - Simulate network partitions and node failures to test replication and failover mechanisms.

4. **Security Considerations**:
   - Use authentication and TLS encryption for secure communication in production.

### Conclusion
By conducting extensive tests on Raspberry Pi and PC setups over a Gigabit Ethernet network, teams can ensure that the system is ready for production in high-traffic, event-driven architectures.

---

Author: **Adriano Machado**
