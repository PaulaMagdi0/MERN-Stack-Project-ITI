#!/bin/bash

echo "Starting json-server..."
cd ~/MERN-Stack-Project-ITI/Back-End || exit
npm start &   # Run in the background

echo "Starting frontend server..."
cd ~/MERN-Stack-Project-ITI/Front-End || exit
npm run dev & # Run in the background

echo "All servers are running."
wait  # Wait for background processes to finish
