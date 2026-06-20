[![Netlify Status](https://api.netlify.com/api/v1/badges/c20b821d-c231-4431-8d3b-fde34814e9b2/deploy-status)](https://app.netlify.com/projects/albums9/deploys)

# Albums
Find albums similar to what you like.

## How it works
1. type an album name in the search box, artist too if you want.
2. Autocomplete will show you some suggestions from discogs as you type.
3. When you submit, musicbrainz will gets the the album's exact name and the artist.
4. Then, Last.fm will find other artist that are similar to the artist of the album.
5. For each similar artist, their top albums are resolved from last.fm and shown to you.
6. Results also come with the album cover and the links to spotify and apple music.

## What's being used
For the backend, I used node.js with express and typerscript. The backend is deployed on [render](https://render.com).
For the frontend, I used vanilla js, html and css deployed on [Netlify](https://netlify.com).
I used [MusicBrainz](https://musicbrainz.org), [Last.fm](https://last.fm) and [Discogs](https://discogs.com) APIs to get the album data.

## Local development
1. Clone the repo
2. Run `npm install` in the root directory to install the dependencies.
3. Run `npm run dev` to start the development server.
4. Make an env file in te root with these stuff:
    ```env
    PORT=3000
    MB_APP_NAME=Albums
    MB_CONTACT= put your email here
    MB_VERSION=any version
    DISCOGS_TOKEN= your discogs token
    LASTFM_API_KEY= your lastfm api key
    ```
6. Open the html file with a live server extension or by opening the file directly in the browser.

## Contributing
Feel free to pull request if you want to add something or fix a bug!