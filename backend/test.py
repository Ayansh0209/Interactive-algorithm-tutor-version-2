from tracer import runCode
import json
code = """

# =============================================================================
# 1. SINGLY LINKED LIST (Simple Linked List)
# =============================================================================

class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    
    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node
    
    def prepend(self, data):
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node
    
    def display(self):
        elements = []
        current = self.head
        while current:
            elements.append(current.data)
            current = current.next
        print(" -> ".join(map(str, elements)) + " -> None")

# =============================================================================
# 2. CIRCULAR LINKED LIST
# =============================================================================

class CircularNode:
    def __init__(self, data):
        self.data = data
        self.next = None

class CircularLinkedList:
    def __init__(self):
        self.head = None
    
    def append(self, data):
        new_node = CircularNode(data)
        if not self.head:
            self.head = new_node
            new_node.next = new_node  # Points to itself
            return
        
        # Find the last node (the one pointing to head)
        current = self.head
        while current.next != self.head:
            current = current.next
        
        # Insert new node
        current.next = new_node
        new_node.next = self.head
    
    def prepend(self, data):
        new_node = CircularNode(data)
        if not self.head:
            self.head = new_node
            new_node.next = new_node
            return
        
        # Find the last node
        current = self.head
        while current.next != self.head:
            current = current.next
        
        # Insert at beginning
        new_node.next = self.head
        current.next = new_node
        self.head = new_node
    
    def display(self):
        if not self.head:
            print("Empty circular list")
            return
        
        elements = []
        current = self.head
        elements.append(current.data)
        current = current.next
        
        # Traverse until we come back to head
        while current != self.head:
            elements.append(current.data)
            current = current.next
        
        print(" -> ".join(map(str, elements)) + " -> (back to " + str(self.head.data) + ")")

# =============================================================================
# 3. CIRCULAR DOUBLY LINKED LIST (Bonus)
# =============================================================================

class CircularDNode:
    def __init__(self, data):
        self.data = data
        self.next = None
        self.prev = None

class CircularDoublyLinkedList:
    def __init__(self):
        self.head = None
    
    def append(self, data):
        new_node = CircularDNode(data)
        if not self.head:
            self.head = new_node
            new_node.next = new_node
            new_node.prev = new_node
            return
        
        # Get the last node (head.prev)
        last = self.head.prev
        
        # Insert new node
        new_node.next = self.head
        new_node.prev = last
        last.next = new_node
        self.head.prev = new_node
    
    def display_forward(self):
        if not self.head:
            print("Empty circular doubly list")
            return
        
        elements = []
        current = self.head
        elements.append(current.data)
        current = current.next
        
        while current != self.head:
            elements.append(current.data)
            current = current.next
        
        print("Forward: " + " <-> ".join(map(str, elements)) + " <-> (circular)")

# =============================================================================
# TEST CODE
# =============================================================================

print("=== SINGLY LINKED LIST ===")
sll = LinkedList()
sll.append(10)
sll.append(20)
sll.append(30)
sll.prepend(5)
sll.display()

print("=== CIRCULAR LINKED LIST ===")
cll = CircularLinkedList()
cll.append(100)
cll.append(200)
cll.append(300)
cll.prepend(50)
cll.display()

print("=== CIRCULAR DOUBLY LINKED LIST ===")
cdll = CircularDoublyLinkedList()
cdll.append(1000)
cdll.append(2000)
cdll.append(3000)
cdll.display_forward()


"""

trace = runCode(code)

with open("debug_output.json", "w", encoding="utf-8") as f:
    json.dump(trace, f, indent=2)

print(" Trace saved to debug_output.json")