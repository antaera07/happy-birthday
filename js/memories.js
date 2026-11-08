// =====================================================================
//  YOUR 24 MEMORIES  (edit this file)
//
//  photo : the picture file. Easiest is to replace assets/photos/photo01.jpg ...
//          photo24.jpg with your own photos (keep the same file names).
//          Any shape works - it is cropped to fit the frame's square opening.
//  frame : which of the 24 polaroid frames to use (1 - 24, see assets/frames/)
//  title : the heading written at the top of the letter
//  note  : the letter. \n makes a new line.
//
//  Memories 1-6 are hidden in area 1, 7-12 in area 2, 13-18 in area 3 and
//  19-24 in area 4. Inside an area they appear in the order the glowing
//  orbs are listed in js/areas.js.
// =====================================================================
const MEMORIES = [
 {
  "photo": "assets/photos/photo01.jpg",
  "frame": 1,
  "title": "Sneaky me >.<",
  "note": "Of course I would include this! My favourite. I need to sneak more pics of us when you're not watching! \n\n This pic has a special place in my heart hehe. You sleeping on me has to be my favourite genre of us<3 I love you a lot, my love💖\n\nLove, your baby"
 },
 {
  "photo": "assets/photos/photo02.jpg",
  "frame": 2,
  "title": "Our Date ^~^",
  "note": "Aaahh I love everyyyyything about this date. The bouquet, the movie, the photobooth, my child kuromi, the pasta and drinks, us playing jenga. God, I looovveee the 3rd of August so much!! \n\nLove, your one n only"
 },
 {
  "photo": "assets/photos/photo03.jpg",
  "frame": 3,
  "title": "Sleepy Baby",
  "note": "Look at you, sleepy but still worried about me. god you my baby, YOU are the sweetest thing that has ever happened to me and i couldn't ask for more. \n\nLove, your sweetlove."
 },
 {
  "photo": "assets/photos/photo04.jpg",
  "frame": 4,
  "title": "Us (^///^)",
  "note": "Of course I was going to include this picture. How can i not? you're sleeping on my shoulder!! arfghfhg i really have a thing for you resting on me!! \n\nLove, your pillow."
 },
 {
  "photo": "assets/photos/photo05.jpg",
  "frame": 5,
  "title": "Cute",
  "note": "Do you remember this, baby? C block, us and flowers. I love decorating my baby's hair with flowers. Delicate flowers for my delicate baby XD\n\nLove, your florist."
 },
 {
  "photo": "assets/photos/photo06.jpg",
  "frame": 6,
  "title": "You and glasses",
  "note": "I just lovee this picture, you in glasses is a different level of cuteness🥹 \n\n I love you my baby mwaahh i wish i could see this era of you live \n\n Love, your love."
 },
 {
  "photo": "assets/photos/photo07.jpg",
  "frame": 7,
  "title": "Pigtailsss ☆*: .｡. o(≧▽≦)o .｡.:*☆",
  "note": " Ahhh i wanna make your pigtails again. you looked soooo cute ehehehehe we should definitely do this again right my love?\n\nLove, your hairstylist."
 },
 {
  "photo": "assets/photos/photo08.jpg",
  "frame": 8,
  "title": "Paper Ringss",
  "note": "Yes, I'd marry you with paper rings, my love <3 I will learn every type of craft there is to make stuff for you my baby hehe mwaahh \n\nLove, your paper ringed wifey."
 },
 {
  "photo": "assets/photos/photo09.jpg",
  "frame": 9,
  "title": "Best Day Ever",
  "note": "1st date day again. I know it says best day ever but everyday with you is my best ever! You know it was my first ever official date and you made it the best I could ever have! \n\n God, I love you a lot my baby.\n\nLove, your best date ever!"
 },
 {
  "photo": "assets/photos/photo10.jpg",
  "frame": 10,
  "title": "Flowers, flowers🌸",
  "note": "Hehehe as you can see i looovvveee decorating your hair with anything and everything. Next target, put tiny clips on your hair hehehe soon baby be prepared!! MUHEHEHEHEHE\n\nLove, your hairstylist, again."
 },
 {
  "photo": "assets/photos/photo11.jpg",
  "frame": 11,
  "title": "UHM  o(*////▽////*)q",
  "note": "I have no words for this hehehe i love leaving my marks on you AND i love when you leave your marks on me. it's like you're my canvas and i paint on you lol. \n\nLove, your painter."
 },
 {
  "photo": "assets/photos/photo12.jpg",
  "frame": 12,
  "title": "We look so cute!",
  "note": "Another favourite of mine. We actually look soooooo cute together!! That woman did not lie. we're a cute couple ehehehehe mwaaahh!! here's to more and more and moreee dates with you my baby!\n\nLove, your lover."
 },
 {
  "photo": "assets/photos/photo13.jpg",
  "frame": 13,
  "title": "Waffles",
  "note": "Our main motive was to get waffles, which btw was promised to me MONTHS ago (when we were not even together) but we ended up having soo much fun window shopping!! Every treat with you is my absolute fave mine baby<3\n\nLove, your sweet-toothed baby."
 },
 {
  "photo": "assets/photos/photo14.jpg",
  "frame": 14,
  "title": "Window shopping fun fun :p",
  "note": "Ahhhhh our second date was sooooooooo much fun, we had sm fun laughing around, judging clothes and trying on the stupidest hats and bags!! \n\n Doing stupid and dumb things together is our brand hehe!!\n\nLove, your dumbass."
 },
 {
  "photo": "assets/photos/photo15.jpg",
  "frame": 15,
  "title": "Just US",
  "note": "Just you and i, coming out of our hostels everyday just so we could sit together, because being with each other brings us so much peace and joy. Just sitting around at pmc or in front of new building, sneaking kisses, taking risks. Every part of us is so fun baby! Except for when i have to be aware of our surroundings, that's your job, baby!\n\nLove, your crime partner."
 },
 {
  "photo": "assets/photos/photo16.jpg",
  "frame": 16,
  "title": "Shoes",
  "note": "Even our shoes look good together hehe!! Every part of me was made for every part of you, my love. I wanna dissolve into you so i dont have to be apart from you. i miss you so much, god.\n\nLove, your other complete half. (you're 100% and i'm 100% and together we're 200%)"
 },
 {
  "photo": "assets/photos/photo17.jpg",
  "frame": 17,
  "title": "My cutie!",
  "note": "Yes, this was one of the characters you had to choose from. Did you choose this one? I'm pretty sure you did hehe! I love my lil cutie baby my child my everything ugh i wish to hold you in my arms so bad, my baby. c'mereeeeee arfgh. soon. i'll hold you and never let go.\n\nLove, yours."
 },
 {
  "photo": "assets/photos/photo18.jpg",
  "frame": 18,
  "title": "BLEEE",
  "note": "Look at you!! BLEEE!! \n\n i miss your tongue in my mouth \n\nLove, your tongue-holder."
 },
 {
  "photo": "assets/photos/photo19.jpg",
  "frame": 19,
  "title": "Our third date",
  "note": "We tried so hard to make a time lapse of us only to fail because my phone gave up on me. But we still had so much fun, my baby! \n\n The food was soooooooooooo delicious we are definitely going here again!!\n\nLove, your forever date."
 },
 {
  "photo": "assets/photos/photo20.jpg",
  "frame": 20,
  "title": "Photobooth date",
  "note": "You're correct. We lose our minds here baby. We'll never be fully prepared with poses but we always have soooooooo much fun hehe. I need more more more photobooth dates with you my baby!\n\nLove, your modelpartner."
 },
 {
  "photo": "assets/photos/photo21.jpg",
  "frame": 21,
  "title": "Diamond",
  "note": "Our pmc shehnanigans. idk what to say here. except for the fact that i love every moment with you, SPECIALLY these baby. going out everyday just to see each other. never getting enough of you baby, never.\n\nLove, your free tenant(and you're my free tenant)"
 },
 {
  "photo": "assets/photos/photo22.jpg",
  "frame": 22,
  "title": "Shadows",
  "note": "Our shadows look so fineee baby! we were here to kiss n makeout hehe but too many people we had to run to the corner ughh. but see we look so good together aarfghghgh\n\nLove, your shadow."
 },
 {
  "photo": "assets/photos/photo23.jpg",
  "frame": 23,
  "title": "Gokul Dates",
  "note": "Our gokul dates, sitting there, feeding each other. heaven on earth, i tell you baby. THAT is our future, us taking care of each other, feeding each other, getting two different orders and sharing. that is our love, baby.\n\nLove, your future."
 },
 {
  "photo": "assets/photos/photo24.jpg",
  "frame": 24,
  "title": "My Little Baby",
  "note": "I know you gave me a cleaned up photo but i like this one better, feels more personal baby. My cutie. This lil boy has turned 22!! Can you believe that? Happiesttttttt birthday my lil baby. I wish I could be there to hold you and wish you in person, but arfgh. You've grown to be such a good person, my baby, You know best how to love me and i want to learn how to love you in ways you want to be loved. i want you to feel every bit of love i have for you baby. my heart is too small for all the love i have for you my love. my love for you is soo much that it spills out of my heart and spreads to each and every part of me and when we touch, the love spreads into yours and reaches your heart. I hope you feel it baby. Have an amazing birthday, my dearest. I'm so proud of who you are today. I can't wait to hold you.\n\nLove, your life."
 }
];
