from sarvamai import SarvamAI

API_KEY = "sk_lahp42w4_8K8JJohnNZZFOaNypvGOPINi"  # Replace with your actual API key

client = SarvamAI(
    api_subscription_key=API_KEY,
)

try:
    response = client.chat.completions(messages=[
        {"role": "user", "content": "Hey, what is the capital of India?"}
    ])
    print(response.choices[0].message.content)
except Exception as e:
    print(f"An error occurred: {e}")