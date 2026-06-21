import sys
sys.path.append(".")
from rag import get_legal_guidance

queries = [
    "what should i do i have commited murder",
    "mene qatl kiya hai ab kya karu"
]

with open("../scratch/output.txt", "w", encoding="utf-8") as f:
    for q in queries:
        f.write(f"\n=== QUERY: {q} ===\n")
        res = get_legal_guidance(q)
        f.write(res["response"])
        f.write("\n")

print("Done writing to output.txt!")
