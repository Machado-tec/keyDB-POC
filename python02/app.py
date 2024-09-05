
# python02/app.py
import redis
import time

class KeyEventObserver:
    def __init__(self, host, port, db):
        self.redis_client = redis.StrictRedis(host=host, port=port, db=db)
        self.pubsub = self.redis_client.pubsub()
        # Subscribe to key space notifications
        self.pubsub.psubscribe('__keyevent@0__:set')

    def handle_event(self, message):
        if message['type'] == 'pmessage':
            key = message['data'].decode('utf-8')
            if key == 'shared_key':  # Only handle shared_key events
                shared_value = self.redis_client.get("shared_key")
                if shared_value:
                    # Extract the timestamp from shared_key and calculate the difference
                    timestamp_str = shared_value.decode('utf-8').split()[-1]
                    written_time = int(timestamp_str)
                    current_time = int(time.time())
                    time_difference = current_time - written_time
                    print(f"Python02 read shared_key: {shared_value.decode('utf-8')}, "
                          f"Time difference: {time_difference} seconds")
                    
                    # Perform handshake operation
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