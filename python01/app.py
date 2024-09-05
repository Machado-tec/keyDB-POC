# Author: Adriano Machado

import time
import redis

def main():
    try:
        r = redis.StrictRedis(host='keydb_01', port=6379, db=0)
        
        # Set the initial update interval to 10 seconds if not already set
        if not r.exists("update_interval"):
            r.set("update_interval", 10)
        
        while True:
            value = f"Python01 timestamp {int(time.time())}"
            r.set("shared_key", value)
            print(f"Python01 set shared_key: {value}")
            
            # Get the current interval from Redis
            interval = int(r.get("update_interval"))
            print(f"Current update interval: {interval} seconds")
            time.sleep(interval)
    
    except redis.ConnectionError as e:
        print(f"Redis connection error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    print("Starting Python01")
    main()