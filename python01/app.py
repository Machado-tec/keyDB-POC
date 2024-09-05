
# python01/app.py
import time
import redis

def main():
    try:
        r = redis.StrictRedis(host='keydb_01', port=6379, db=0)
        while True:
            value = f"Python01 timestamp {int(time.time())}"
            r.set("shared_key", value)
            print(f"Python01 set shared_key: {value}")
            time.sleep(10)
    except redis.ConnectionError as e:
        print(f"Redis connection error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    print("Starting Python01")
    main()