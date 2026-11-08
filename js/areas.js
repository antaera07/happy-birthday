// Area layout: exits and collectible spots, in stage coordinates (1672 x 941).
// Every point sits on the walkable path. exits[a][b] = the doorway in area a that leads to area b.
const STAGE_W = 1672, STAGE_H = 941;
const AREAS = {
 "1": {
  "exits": {
   "2": [
    390,
    222
   ],
   "4": [
    298,
    894
   ]
  },
  "collectibles": [
   [
    1316,
    788
   ],
   [
    1036,
    716
   ],
   [
    1236,
    348
   ],
   [
    1484,
    580
   ],
   [
    588,
    804
   ],
   [
    276,
    476
   ]
  ]
 },
 "2": {
  "exits": {
   "1": [
    1086,
    314
   ],
   "3": [
    1266,
    919
   ]
  },
  "collectibles": [
   [
    1012,
    780
   ],
   [
    1228,
    716
   ],
   [
    460,
    764
   ],
   [
    740,
    580
   ],
   [
    748,
    852
   ],
   [
    1260,
    444
   ]
  ]
 },
 "3": {
  "exits": {
   "2": [
    522,
    278
   ],
   "4": [
    1230,
    818
   ]
  },
  "collectibles": [
   [
    708,
    756
   ],
   [
    500,
    756
   ],
   [
    716,
    900
   ],
   [
    1052,
    452
   ],
   [
    780,
    404
   ],
   [
    1252,
    596
   ]
  ]
 },
 "4": {
  "exits": {
   "3": [
    58,
    418
   ],
   "1": [
    478,
    330
   ]
  },
  "collectibles": [
   [
    924,
    228
   ],
   [
    1316,
    924
   ],
   [
    284,
    756
   ],
   [
    1532,
    364
   ],
   [
    812,
    780
   ],
   [
    1172,
    540
   ]
  ]
 }
};
