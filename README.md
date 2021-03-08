# Story-Time
A multi-player story writing interface.

**Quick Start**

# Clone the repository
git clone https://github.com/modivishal/Story-Time.git

# Install dependencies
npm install

# Run the server
node server/index.js

# Start the client
npm run start

# Build for production
npm run build

**Documentation**
Folder Structure - All the client side code (react, css, js and any other assets) is inside the src directory. Backend Node.js/Express code is under the server directory.

**Features**
- Using this app user can write the same story together, but only one person can control their keyboard at a time. 

- It supports 5 connection at the same time. one person gets 10 seconds to write whatever they want, everybody sees the story being written in real time and when the timer is up, the next person in the queue will get 10 seconds to add to the story.

- The server persists the current story as long as there are people connected to write. As soon as everybody disconnects, it resets.
