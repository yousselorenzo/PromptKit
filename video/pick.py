#!/usr/bin/env python3
"""Print today's episode ids (one per bundle, rotating through that bundle's episodes), one per line."""
import datetime, json
eps = json.load(open("episodes.json")); d = datetime.date.today().toordinal()
by = {}
for e in eps: by.setdefault(e["bundle"], []).append(e["id"])
for b, ids in by.items(): print(ids[d % len(ids)])
