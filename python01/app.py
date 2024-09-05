#Author: Adriano Machado

import time
import redis

def main():
    try:
        r = redis.StrictRedis(host='keydb_01', port=6379, db=0)
        # Initialize the interval to 10 seconds
        r.set('update_interval', '10')
        
        while True:
            # Fetch the current interval from Redis
            interval = int(r.get('update_interval'))
            value = f"Python01 timestamp {int(time.time())}"
            r.set("shared_key", value)
            print(f"Python01 set shared_key: {value}, update interval: {interval} seconds")
            time.sleep(interval)
    except redis.ConnectionError as e:
        print(f"Redis connection error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    print("Starting Python01")
    main()