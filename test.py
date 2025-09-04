def generate_binary_txt_file(filename="binary_50MB.txt", size_in_mb=75):
    size_in_bytes = size_in_mb * 1024 * 1024  # Convert MB to bytes
    binary_data = '01' * (size_in_bytes // 2)  # Each character is 1 byte

    # If odd number of bytes required, add one extra character
    if len(binary_data) < size_in_bytes:
        binary_data += '0'

    with open(filename, 'w') as f:
        f.write(binary_data)

    print(f"{filename} generated with size {size_in_mb} MB containing binary data.")

generate_binary_txt_file()
