from tracer import runCode
import json
code = """
def solve(row, n, board):
    if row == n:
        return True

    for col in range(n):
        if is_safe(row, col, board):
            board[row] = col
            if solve(row + 1, n, board):
                return True
            board[row] = -1
    return False

def is_safe(row, col, board):
    for i in range(row):
        if board[i] == col or abs(board[i] - col) == abs(i - row):
            return False
    return True

N = 10

board = [-1] * N
solve(0, N, board)


"""

trace = runCode(code)

with open("debug_output.json", "w", encoding="utf-8") as f:
    json.dump(trace, f, indent=2)

print(" Trace saved to debug_output.json")