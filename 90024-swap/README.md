# 90024-Swap 

This is 90024-Swap, a marketplace tailored specifically for the UCLA
ecosystem. We wanted to make a trusted space where Bruins can hire other
Bruins for quick gigs (like tutoring for Physics 1A, making a graphic
design flyer for a campus club, or helping move dorms in Hedrick Summit).

# Tech Stack 
Frontend: React Native
Backend: Firebase 
Build tool: Expo Go
Languages: Typescript, Javascript

# Features

### 1. Secure UCLA Sign-In Page
Ensured our app is safe to use by checking for only UCLA-affiliated
users. This decreases the chances of our users getting scammed.  
* **Email validation:** The Regex checks to make sure the input string
strictly ends with @ucla.edu or @g.ucla.edu.
* **Password validation:** Enforces security by checking that the
password length is strictly greater than 8 characters before letting the
user press submit.

## 2. Dynamic Listing Feed
We used the core JavaScript array methods we learned in the React
lectures to make the feed work. 
* **map()**: We used this to loop through our database array and dynamically render all the individual listing cards onto the screen.
* **filter()**: Used to handle topic and category sorting (like switching between "Skills" and "Goods") and search queries.
* **Information Hiding:** To keep our code clean, we encapsulated the whole data-entry system into a single AddListing component interface. This hides the messy input state logic away from the rest of the app's main layout.

## 3. Peer-to-Peer Messaging System
We mapped out a custom data structure to handle backend chat rooms
between buyers and sellers. It's broken into two main parts:

* **Conversation**: This object represents a chat thread. It tracks a unique thread ID, the senderId, the recipientId, and an associatedListingId (so both users actually know what gig they are talking about).
* **Messages**: Tucked inside each conversation is an array of messages tracking the actual text content, who sent it (senderId), and a timestamp so the messages render in the correct chronological order on the screen.


# How to Run Locally
1. Clone this repository.
2. Run `npm install` to get all the node modules.
3. Run `npx expo start` to start the Expo bundler.
4. If you have macOS, enter i in the terminal. This will boot the simulator. Alternatively, download the Expo Go app on your mobile device and scan the QR code in your terminal. This will open the app. 

