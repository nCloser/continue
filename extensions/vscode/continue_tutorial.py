"""                    _________               _____ _____
                       __  ____/______ _______ __  /____(_)_______ ____  _______
                       _  /     _  __ \__  __ \_  __/__  / __  __ \_  / / /_  _ \
                       / /___   / /_/ /_  / / // /_  _  /  _  / / // /_/ / /  __/
                       \____/   \____/ /_/ /_/ \__/  /_/   /_/ /_/ \__,_/  \___/

                                 Chat, Edit, and Autocomplete tutorial
"""

# ———————————————————— Chat [Ctrl/Ctrl + L]: Ask "what sorting algorithm is this?" ————————————————————

def sorting_algorithm(x):
    for i in range(len(x)):
        for j in range(len(x) - 1):
            if x[j] > x[j + 1]:
                x[j], x[j + 1] = x[j + 1], x[j]
    return x

# —————————————————— Edit [Cmd/Ctrl + I]: Tell Continue to "make this more readable" —————————————————

def sorting_algorithm(x):
    """
    This function sorts a list of numbers in ascending order using a simple sorting algorithm.
    """
    # Outer loop iterates over the list
    for i in range(len(x)):
        # Inner loop compares adjacent elements and swaps them if needed
        for j in range(len(x) - 1):
            if x[j] > x[j + 1]:
                x[j], x[j + 1] = x[j + 1], x[j]
    # Return the sorted list
    return x


# ——————————————— Autocomplete [Tab]: Place cursor after `:` below and press [Enter] —————————————————

# Basic assertion for sorting_algorithm:
def test_sorting_algorithm():
    assert sorting_algorithm([3, 1, 2]) == [1, 2, 3]
    assert sorting_algorithm([5, 4, 3, 2, 1]) == [1, 2, 3, 4, 5]
    assert sorting_algorithm([1, 2, 3, 4, 5]) == [1, 2, 3, 4, 5]
    assert sorting_algorithm([]) == []
    assert sorting_algorithm([1]) == [1]
    # Add more test cases as needed
    assert sorting_algorithm([-1, -2, -3]) == [-3, -2, -1]

# Run the test function
test_sorting_algorithm()


# Write the QuickSort
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

"—————————————————— Learn more at https://docs.continue.dev/getting-started/overview ————————————————"