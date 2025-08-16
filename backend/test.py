from tracer import runCode
import json
code = """
class DNode:
    def __init__(self, value):
        self.data = value
        self.next_ref = None
        self.prev_ref = None

class DoublyLinkedList:
    def __init__(self):
        self.head_node = None

    def append(self, val):
        node = DNode(val)
        if not self.head_node:
            self.head_node = node
            return
        cur = self.head_node
        while cur.next_ref:
            cur = cur.next_ref
        cur.next_ref = node
        node.prev_ref = cur

    def prepend(self, val):
        node = DNode(val)
        if self.head_node:
            self.head_node.prev_ref = node
        node.next_ref = self.head_node
        self.head_node = node

    def insert_after(self, target_val, new_val):
        cur = self.head_node
        while cur and cur.data != target_val:
            cur = cur.next_ref
        if cur:
            node = DNode(new_val)
            node.next_ref = cur.next_ref
            node.prev_ref = cur
            if cur.next_ref:
                cur.next_ref.prev_ref = node
            cur.next_ref = node

    def display_forward(self):
        cur = self.head_node
        while cur:
            print(cur.data, end=" <-> ")
            cur = cur.next_ref
        print("None")

    def display_backward(self):
        cur = self.head_node
        while cur and cur.next_ref:
            cur = cur.next_ref
        while cur:
            print(cur.data, end=" <-> ")
            cur = cur.prev_ref
        print("None")

# Test
dll = DoublyLinkedList()
dll.append(10)
dll.append(20)
dll.append(40)
dll.insert_after(20, 30)
dll.prepend(5)
dll.display_forward()
dll.display_backward()




"""

trace = runCode(code)

with open("debug_output.json", "w", encoding="utf-8") as f:
    json.dump(trace, f, indent=2)

print(" Trace saved to debug_output.json")