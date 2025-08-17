from tracer import runCode
import json
code = """
# =============================================================================
# EXTREME STRESS TEST - CHALLENGING CLASS NAMES FOR TRACER
# =============================================================================

# Test 1: Generic names that don't hint at structure
class Item:
    def __init__(self, val):
        self.info = val
        self.pointer = None

class Container:
    def __init__(self):
        self.start = None
    
    def add(self, val):
        element = Item(val)
        if not self.start:
            self.start = element
        else:
            current = self.start
            while current.pointer:
                current = current.pointer
            current.pointer = element

# Test 2: Misleading names (sounds like tree but it's a linked list)
class TreeNode:
    def __init__(self, value):
        self.data = value
        self.child = None  # This is actually "next"

class Forest:
    def __init__(self):
        self.root = None   # This is actually "head"
    
    def plant(self, val):
        tree = TreeNode(val)
        if not self.root:
            self.root = tree
        else:
            current = self.root
            while current.child:
                current = current.child
            current.child = tree

# Test 3: Mathematical/Scientific names
class Vector:
    def __init__(self, magnitude):
        self.magnitude = magnitude
        self.direction = None

class Space:
    def __init__(self):
        self.origin = None
    
    def add_vector(self, mag):
        v = Vector(mag)
        if not self.origin:
            self.origin = v
        else:
            current = self.origin
            while current.direction:
                current = current.direction
            current.direction = v

# Test 4: Totally random names
class Banana:
    def __init__(self, color):
        self.color = color
        self.stem = None

class Basket:
    def __init__(self):
        self.bottom = None
    
    def put_banana(self, color):
        fruit = Banana(color)
        if not self.bottom:
            self.bottom = fruit
        else:
            current = self.bottom
            while current.stem:
                current = current.stem
            current.stem = fruit

# Test 5: Business/Abstract names
class Transaction:
    def __init__(self, amount):
        self.amount = amount
        self.follows = None

class Ledger:
    def __init__(self):
        self.first_entry = None
    
    def record(self, amount):
        entry = Transaction(amount)
        if not self.first_entry:
            self.first_entry = entry
        else:
            current = self.first_entry
            while current.follows:
                current = current.follows
            current.follows = entry

# Test 6: Confusing doubly-linked (sounds like single)
class Element:
    def __init__(self, data):
        self.data = data
        self.forward = None
        self.backward = None

class Chain:
    def __init__(self):
        self.front = None
    
    def link(self, data):
        part = Element(data)
        if not self.front:
            self.front = part
        else:
            current = self.front
            while current.forward:
                current = current.forward
            current.forward = part
            part.backward = current

# Test 7: Names that sound like other data structures
class StackElement:  # Sounds like stack but it's a linked list!
    def __init__(self, value):
        self.value = value
        self.below = None  # This is "next"

class Tower:
    def __init__(self):
        self.base = None  # This is "head"
    
    def stack(self, value):
        block = StackElement(value)
        if not self.base:
            self.base = block
        else:
            current = self.base
            while current.below:
                current = current.below
            current.below = block

# Test 8: Circular with confusing names
class Atom:
    def __init__(self, element):
        self.element = element
        self.bond = None

class Molecule:
    def __init__(self):
        self.center = None
    
    def add_atom(self, element):
        atom = Atom(element)
        if not self.center:
            self.center = atom
            atom.bond = atom  # Circular!
        else:
            current = self.center
            while current.bond != self.center:
                current = current.bond
            current.bond = atom
            atom.bond = self.center

# Test 9: Really abstract names
class Concept:
    def __init__(self, idea):
        self.idea = idea
        self.relation = None
        self.inverse_relation = None

class Philosophy:
    def __init__(self):
        self.foundation = None
    
    def contemplate(self, idea):
        thought = Concept(idea)
        if not self.foundation:
            self.foundation = thought
        else:
            current = self.foundation
            while current.relation:
                current = current.relation
            current.relation = thought
            thought.inverse_relation = current

# =============================================================================
# STRESS TESTS
# =============================================================================

print("=== Test 1: Generic Names ===")
container = Container()
container.add("A")
container.add("B")
container.add("C")
print("Container test complete")

print("=== Test 2: Misleading Tree Names ===")
forest = Forest()
forest.plant("Oak")
forest.plant("Pine") 
forest.plant("Maple")
print("Forest test complete")

print("=== Test 3: Mathematical Names ===")
space = Space()
space.add_vector(10)
space.add_vector(20)
space.add_vector(30)
print("Space test complete")

print("=== Test 4: Random Names ===")
basket = Basket()
basket.put_banana("Yellow")
basket.put_banana("Green")
basket.put_banana("Brown")
print("Basket test complete")

print("=== Test 5: Business Names ===")
ledger = Ledger()
ledger.record(100.50)
ledger.record(250.75)
ledger.record(89.25)
print("Ledger test complete")

print("=== Test 6: Confusing Doubly-Linked ===")
chain = Chain()
chain.link("Link1")
chain.link("Link2")
chain.link("Link3")
print("Chain test complete")

print("=== Test 7: Stack-like Names ===")
tower = Tower()
tower.stack("Block1")
tower.stack("Block2")
tower.stack("Block3")
print("Tower test complete")

print("=== Test 8: Circular with Chemistry Names ===")
molecule = Molecule()
molecule.add_atom("H")
molecule.add_atom("O")
molecule.add_atom("N")
print("Molecule test complete")

print("=== Test 9: Abstract Philosophy Names ===")
philosophy = Philosophy()
philosophy.contemplate("Existence")
philosophy.contemplate("Reality")
philosophy.contemplate("Truth")
print("Philosophy test complete")

print("=== ALL STRESS TESTS COMPLETED ===")
print("Your tracer must detect these as linked lists based on ATTRIBUTES, not names!")

"""

trace = runCode(code)

with open("debug_output.json", "w", encoding="utf-8") as f:
    json.dump(trace, f, indent=2)

print(" Trace saved to debug_output.json")