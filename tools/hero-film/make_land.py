"""Regenerates land.json for globe.html: points spread evenly over the sphere
(a Fibonacci lattice), kept where they fall inside a country in ../../world.geojson.
Run from the repository root: python3 tools/hero-film/make_land.py  (needs numpy)"""
import json, math
from pathlib import Path
import numpy as np

HERE = Path(__file__).resolve().parent
geo = json.loads((HERE.parent.parent / "world.geojson").read_text())
polys = []
for f in geo["features"]:
    g = f["geometry"]
    if not g:
        continue
    polys.extend([g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"])

def inside_ring(lng, lat, ring):
    ring = np.asarray(ring); x, y = ring[:, 0], ring[:, 1]
    xj, yj = np.roll(x, 1), np.roll(y, 1)
    res = np.zeros(lng.shape, bool)
    for xi, yi, xk, yk in zip(x, y, xj, yj):
        res ^= ((yi > lat) != (yk > lat)) & (lng < (xk - xi) * (lat - yi) / (yk - yi + 1e-12) + xi)
    return res

N = 60000                                   # about 0.8 degrees between dots
i = np.arange(N) + 0.5
lat = 90 - np.degrees(np.arccos(1 - 2 * i / N))
lng = (np.degrees(math.pi * (1 + 5 ** 0.5) * i) + 180) % 360 - 180
land = np.zeros(N, bool)
for poly in polys:
    outer = np.asarray(poly[0])
    m = (lng >= outer[:, 0].min()) & (lng <= outer[:, 0].max()) & (lat >= outer[:, 1].min()) & (lat <= outer[:, 1].max()) & ~land
    if not m.any():
        continue
    idx = np.where(m)[0]
    ins = inside_ring(lng[idx], lat[idx], poly[0])
    for hole in poly[1:]:
        ins &= ~inside_ring(lng[idx], lat[idx], hole)
    land[idx[ins]] = True
pts = np.stack([lat[land], lng[land]], 1).round(3).tolist()
(HERE / "land.json").write_text(json.dumps(pts, separators=(",", ":")))
print(f"land.json: {len(pts)} dots")
