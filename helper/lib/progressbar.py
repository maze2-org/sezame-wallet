import sys

def progress(current, total, bar_length=50):
    ratio = current / total
    hashes = '#' * int(round(ratio * bar_length))
    spaces = ' ' * (bar_length - len(hashes))
    percent = int(round(ratio * 100))
    sys.stdout.write(f"\rProgress: [{hashes}{spaces}] {percent}% ({current} of {total})")
    sys.stdout.flush()