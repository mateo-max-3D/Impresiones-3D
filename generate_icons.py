import zlib
import struct
import math

def create_png(width, height, filename):
    # Generates a clean 3D industrial cube logo PNG with dark theme and blue/orange highlights
    raw_data = bytearray()
    
    cx, cy = width / 2.0, height / 2.0
    r_max = width / 2.0
    
    for y in range(height):
        row = bytearray([0]) # Filter type None
        for x in range(width):
            # Background dark metallic gradient
            dist = math.hypot(x - cx, y - cy)
            
            # Rounded corner background box
            corner_r = width * 0.18
            dx = max(abs(x - cx) - (width/2 - corner_r), 0)
            dy = max(abs(y - cy) - (height/2 - corner_r), 0)
            box_dist = math.hypot(dx, dy)
            
            if box_dist > corner_r:
                # Transparent outside rounded squircle
                r, g, b, a = 0, 0, 0, 0
            else:
                # Dark navy/slate background
                grad_factor = (x + y) / (width + height * 1.2)
                r = int(14 + 10 * grad_factor)
                g = int(20 + 10 * grad_factor)
                b = int(27 + 15 * grad_factor)
                a = 255
                
                # Draw isometric cube
                nx = (x - cx) / (width * 0.35)
                ny = (y - cy) / (height * 0.35)
                
                # Isometric math
                # Top face
                if abs(nx) <= 0.8 and ny >= -0.7 and (ny + 0.5 * abs(nx)) <= 0:
                    r, g, b = 47, 53, 62
                    if abs(ny + 0.5 * abs(nx)) < 0.04 or abs(nx) > 0.76 or ny < -0.66:
                        r, g, b = 182, 196, 255
                # Left face
                elif nx < 0 and nx >= -0.8 and (ny - 0.5 * nx) <= 0.7 and ny >= 0.5 * nx:
                    r, g, b = 22, 28, 36
                    if abs(ny - 0.5 * nx - 0.7) < 0.04 or abs(nx) > 0.76 or abs(ny - 0.5 * nx) < 0.04:
                        r, g, b = 182, 196, 255
                # Right face
                elif nx >= 0 and nx <= 0.8 and (ny + 0.5 * nx) <= 0.7 and ny >= -0.5 * nx:
                    r, g, b = 26, 32, 40
                    if abs(ny + 0.5 * nx - 0.7) < 0.04 or abs(nx) > 0.76 or abs(ny + 0.5 * nx) < 0.04:
                        r, g, b = 182, 196, 255
                
                # Center energy core
                core_dist = math.hypot(nx, ny)
                if core_dist < 0.16:
                    r, g, b = 0, 85, 255
                elif core_dist < 0.22:
                    r, g, b = 182, 196, 255
                    
                # Laser vertical beam
                if abs(nx) < 0.03 and 0.1 <= ny <= 0.55:
                    r, g, b = 255, 87, 8
                
                # Outer glow border
                if box_dist > corner_r - 2:
                    r, g, b = 67, 70, 86

            row.extend([r, g, b, a])
        raw_data.extend(row)

    # Compress IDAT
    compressed = zlib.compress(bytes(raw_data), 9)
    
    # PNG Structure
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    
    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png.extend(struct.pack('>I', len(ihdr_data)))
    png.extend(b'IHDR')
    png.extend(ihdr_data)
    png.extend(struct.pack('>I', zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff))
    
    # IDAT
    png.extend(struct.pack('>I', len(compressed)))
    png.extend(b'IDAT')
    png.extend(compressed)
    png.extend(struct.pack('>I', zlib.crc32(b'IDAT' + compressed) & 0xffffffff))
    
    # IEND
    png.extend(struct.pack('>I', 0))
    png.extend(b'IEND')
    png.extend(struct.pack('>I', zlib.crc32(b'IEND') & 0xffffffff))
    
    with open(filename, 'wb') as f:
        f.write(png)
    print(f"Generated {filename}")

if __name__ == '__main__':
    create_png(192, 192, 'icons/icon-192.png')
    create_png(512, 512, 'icons/icon-512.png')
    create_png(96, 96, 'icons/favicon.png')
