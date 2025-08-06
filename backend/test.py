from tracer import runCode
import json
code = """
def is_prime(n):
    if n <= 1:
        return False

    for i in range(2, n):
        if n % i == 0:
            return False
    return True

number = 7
result = is_prime(number)
print("Prime?" , result)
"""

trace = runCode(code)

with open("debug_output.json", "w", encoding="utf-8") as f:
    json.dump(trace, f, indent=2)

print(" Trace saved to debug_output.json")