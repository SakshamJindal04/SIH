# iot/iot_simulator.py

import requests
import random
import time
from datetime import datetime, timedelta

# The URL of the backend server's verify endpoint
BACKEND_URL = "http://localhost:3000/verify"

def generate_product_data():
    """Generates random data for a packaged item."""

    # Generate a barcode that has a high chance of being valid or invalid
    barcode = "89" + "".join(random.choices("0123456789", k=10))
    if random.random() < 0.1: # 10% chance of an invalid barcode
        barcode = "50" + "".join(random.choices("0123456789", k=10))

    # Generate a random expiry date (can be in the past or future)
    days_offset = random.randint(-60, 365) # Can expire up to 60 days ago or up to a year from now
    expiry_date = datetime.now() + timedelta(days=days_offset)
    
    # Generate other random data
    data = {
        "barcode": barcode,
        "weight": round(random.uniform(50.0, 1000.0), 2),
        "mrp": round(random.uniform(10.0, 500.0), 2),
        "expiry": expiry_date.isoformat() # ISO 8601 format is easily parsed by JS new Date()
    }
    return data


def main():
    """Main loop to simulate an IoT device sending data."""
    print("🤖 IoT Device Simulator: STARTED")
    print(f"📡 Sending data to: {BACKEND_URL}")

    while True:
        try:
            product_data = generate_product_data()
            print("\n-------------------------------------------")
            print(f"📦 Generated Data: {product_data}")

            # Send the data to the backend via a POST request
            response = requests.post(BACKEND_URL, json=product_data)

            # Print the server's response
            if response.status_code == 200:
                print(f"✅ Server Response (PASS): {response.json()}")
            elif response.status_code == 400:
                 print(f"❌ Server Response (FAIL): {response.json()}")
            else:
                print(f"⚠️  Unexpected Server Response [Code: {response.status_code}]: {response.text}")
        
        except requests.exceptions.ConnectionError:
            print("\n❌ CONNECTION ERROR: Could not connect to the backend.")
            print("   Please make sure the Node.js server is running.")
        
        except Exception as e:
            print(f"\nAn unexpected error occurred: {e}")

        # Wait for 5 seconds before sending the next data packet
        time.sleep(5)


if __name__ == "__main__":
    main()