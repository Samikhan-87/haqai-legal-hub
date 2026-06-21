import sys
import os

# Reconfigure stdout to handle UTF-8 encoding (especially for Urdu script on Windows)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Add backend directory to sys.path so we can import modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from rag import get_legal_guidance

def test_query(q):
    print(f"Testing Query: '{q}'")
    try:
        res = get_legal_guidance(q)
        print("\nRESPONSE CONTENT:")
        print(res["response"])
        print("\nMETRICS:")
        print(res["metrics"])
        print(f"Model used: {res.get('model_used', 'N/A')}")
        print("-" * 80)
    except Exception as e:
        print(f"Error executing query: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Test queries
    test_query("What is the punishment for theft in PPC?")
    test_query("chori ki kya saza hai?")
    test_query("چوری کی سزا کیا ہے؟")
