# Metagov Community Governed Stract Search

This project provides a customizable search interface using Stract's API and Metagov optics. Users can browse MG optics, see the library and guides, and use the search interface.

## Getting Started

1. Clone this repository
2. Change directory to `mg_optics/search_engine` with `cd mg_optics/search_engine`
3. Install dependencies: `npm install`
4. Run the development server: `npm run dev`
5. Open `http://localhost:3000` in your browser

## Project Structure

- `index.html`: Main search interface
- `css/styles.css`: Styles for the search interface
- `js/script.js`: JavaScript for the search interface
- `optics/`: Contains optic files
- `guides/`: Contains guides for using optics
- `api/`: Contains the server-side code

## Using GitHub Pages

This project is set up to be served through GitHub Pages. The `index.html` file in the root directory will be automatically served as the main page.

To enable GitHub Pages:

1. Go to your repository settings
2. Scroll down to the "GitHub Pages" section
3. Select the branch you want to serve (usually `main` or `master`)
4. Save the settings

Your site will be available at `https://yourusername.github.io/mg-optics-search/`

Note: The server-side functionality (`api/server.js`) won't work on GitHub Pages. For a fully functional version, you'll need to deploy the project to a server that can run Node.js.
