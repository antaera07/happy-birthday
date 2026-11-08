
const OBSTACLE_TYPES = {
 "log": {
  "src": "assets/obstacles/log.png",
  "w": 190,
  "h": 104,
  "rx": 103,
  "ry": 31
 },
 "log_m": {
  "src": "assets/obstacles/log_m.png",
  "w": 190,
  "h": 104,
  "rx": 103,
  "ry": 31
 },
 "log_pair": {
  "src": "assets/obstacles/log_pair.png",
  "w": 205,
  "h": 162,
  "rx": 110,
  "ry": 49
 },
 "thorns": {
  "src": "assets/obstacles/thorns.png",
  "w": 200,
  "h": 89,
  "rx": 108,
  "ry": 28
 },
 "thorns_long": {
  "src": "assets/obstacles/thorns_long.png",
  "w": 310,
  "h": 76,
  "rx": 163,
  "ry": 28
 },
 "thorns_rose": {
  "src": "assets/obstacles/thorns_rose.png",
  "w": 200,
  "h": 89,
  "rx": 108,
  "ry": 28
 },
 "rocks": {
  "src": "assets/obstacles/rocks.png",
  "w": 124,
  "h": 99,
  "rx": 70,
  "ry": 30
 },
 "rocks_m": {
  "src": "assets/obstacles/rocks_m.png",
  "w": 108,
  "h": 86,
  "rx": 62,
  "ry": 28
 },
 "rocks_wide": {
  "src": "assets/obstacles/rocks_wide.png",
  "w": 270,
  "h": 112,
  "rx": 143,
  "ry": 34
 },
 "rocks_crystal": {
  "src": "assets/obstacles/rocks_crystal.png",
  "w": 136,
  "h": 109,
  "rx": 76,
  "ry": 33
 }
};

const OBSTACLES = {
 "1": [
  {
   "id": "1-0",
   "type": "log_pair",
   "x": 1452,
   "y": 500,
   "question": "When was our first date?",
   "answers": [
    "3rd august",
    "august 3rd",
    "03/08/26",
    "3 aug",
    "3 Aug",
    "3 August",
    "3rd August",
    "Aug 3",
    "aug 3",
    "3rd aug",
    "03/08",
    "0308",
    "3rd August 2026",
    "August 3rd 2026",
    "3 August 2026",
    "August 3 2026",
    "3 Aug 2026",
    "Aug 3 2026"
   ],
   "hint": "really? you're looking for hints for this question?."
  },
  {
   "id": "1-1",
   "type": "rocks",
   "x": 1276,
   "y": 716,
   "question": "I love you baby!",
   "answers": [
    "I love you more baby",
    "I love you more",
    "I love you more my baby",
    "I love you more baby!",
    "I love you more my baby!",
    "I love you more, baby",
    "I love you more, my baby",
    "I love you more, baby!",
    "I love you more, my baby!"
   ],
   "hint": "seriously? you need a hint for this one?"
  },
  {
   "id": "1-2",
   "type": "thorns_long",
   "x": 988,
   "y": 660,
   "question": "what do you like best about me?",
   "answers": [
    "everything"
   ],
   "hint": "there's just one thing?."
  }
 ],
 "2": [
  {
   "id": "2-0",
   "type": "thorns_long",
   "x": 724,
   "y": 684,
   "question": "date of our first kiss?",
   "answers": [
    "25th may",
    "may 25th",
    "25 may",
    "may 25",
    "25/05/26",
    "25/05",
    "2505",
    "25th May 2026",
    "May 25th 2026",
    "25 May 2026",
    "May 25 2026",
    "25 May 2026",
    "May 25 2026"
   ],
   "hint": "i've told you this twice already, you should remember by now."
  },
  {
   "id": "2-1",
   "type": "rocks_m",
   "x": 660,
   "y": 892,
   "question": "name of the drama we're currently watching?",
   "answers": [
    "Business Proposal",
    "business proposal",
    "Business proposal",
    "business Proposal"
   ],
   "hint": "two words, first starts with B, second starts with P."
  }
 ],
 "3": [
  {
   "id": "3-0",
   "type": "log",
   "x": 740,
   "y": 836,
   "question": "what will you do first when you see me on the 15th?",
   "answers": [
    "hug you",
    "hug",
    "hugging you",
    "hug and kiss you",
    "hug and kiss",
    "hugging and kissing you",
    "hugging and kissing",
    "kiss you",
    "kiss",
    "kissing you",
    "kissing",
    "pull you in my arms",
    "pull you in my arms and hug you",
    "pull you in my arms and hug and kiss you",
    "pull you in my arms and hug and kiss",
    "pull you in my arms and hug and kiss you",
    "pull you in my arms and hug and kiss",
    "pull you in my arms and hug and kiss you"
   ],
   "hint": "you know what you'll do."
  },
  {
   "id": "3-1",
   "type": "rocks_wide",
   "x": 508,
   "y": 724,
   "question": "what am i thinking about right now?",
   "answers": [
    "me ofc",
    "me",
    "me duh",
    "me of course",
    "your baby",
    "your baby ofc",
    "your baby duh",
    "your baby of course"
   ],
   "hint": "what can i do, but think of you?"
  },
  {
   "id": "3-2",
   "type": "thorns_rose",
   "x": 812,
   "y": 572,
   "question": "what do i love most about you?",
   "answers": [
    "everything"
   ],
   "hint": "you know what you love most about me."
  }
 ],
 "4": [
  {
   "id": "4-0",
   "type": "log",
   "x": 628,
   "y": 772,
   "question": "but ive got a feeling wounds are healing ___",
   "answers": [
    "talking on the phone",
    "talking on the phone.",
    "talking on the phone,",
    "talking on the phone!"
   ],
   "hint": "complete the lyrics cmon!"
  },
  {
   "id": "4-1",
   "type": "thorns_rose",
   "x": 668,
   "y": 332,
   "question": "what was the best gift you received?",
   "answers": [
    "sunflower",
    "crocheted sunflower",
    "crocheted sunflower.",
    "crocheted sunflower!",
    "crocheted sunflower,",
    "sunflower you crocheted",
    "sunflower you crocheted.",
    "sunflower you crocheted!",
    "sunflower you crocheted,",
    "crocheted sunflower you made",
    "crocheted sunflower you made.",
    "crocheted sunflower you made!",
    "crocheted sunflower you made,",
    "sunflower you crocheted for me",
    "sunflower you crocheted for me.",
    "sunflower you crocheted for me!",
    "sunflower you crocheted for me,",
    "crocheted sunflower you made for me",
    "crocheted sunflower you made for me.",
    "crocheted sunflower you made for me!",
    "crocheted sunflower you made for me,"
   ],
   "hint": "what did i first give you?"
  },
  {
   "id": "4-2",
   "type": "rocks_wide",
   "x": 1284,
   "y": 884,
   "question": "what is my favourite place to be at?",
   "answers": [
    "my arms",
   ],
   "hint": "try smth related to you, stupid."
  }
 ]
};
