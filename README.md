🐾 Cat-Pinterest


A minimalist, high-performance image gallery dedicated entirely to cats. Built for speed, smoothness, and maximum cuteness.

✨ Features

Infinite Scroll: Seamless browsing experience with lazy loading.

Cat Interactions: Like your favorite feline friends or unlike them if you change your mind.

Favorites Page: A dedicated space to view all the cats you've hearted.

Dockerized: One command to get the whole thing purring.

Lightweight: Minimal dependencies, maximum performance.

🚀 Quick Start

The entire application is containerized for a "zero-config" setup.

Prerequisites

Docker

Docker Compose

Launching the App

Clone the repository:

bash

git clone <repo-url>

cd cat-pinterest



Fire it up:

bash

docker-compose up -d



Open your browser and go to: http://localhost:3000

🛠 Tech Stack


Frontend: React + Vite (for that lightning-fast HMR)

Styling: CSS Modules / Tailwind (clean and responsive)

Deployment: Docker & Docker Compose

API: TheCatAPI (or your custom backend)

📂 Project Structure

/src/components — UI kit (Card, Grid, Navbar)

/src/hooks — Custom hooks for infinite scroll and local storage

/src/pages — Feed (Home) and Favorites page

docker-compose.yml — Container orchestration

🐈 How it Works

Lazy Loading: Images only load when they enter the viewport, saving bandwidth.
Infinite Scroll: A dedicated IntersectionObserver triggers a new API fetch when you reach the bottom of the page.
Persistence: Your "Liked" cats are saved (via LocalStorage or Backend), so they won't disappear after a refresh.
