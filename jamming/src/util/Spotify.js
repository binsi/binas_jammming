let clientID = '8222f4ccde26458bb4a238b4cf597343';
let redirectUri = 'http://binasjammming.surge.sh/'; //'http://localhost:3000/';
let spotifyUrl = `https://accounts.spotify.com/authorize?response_type=token&scope=playlist-modify-public&client_id=${clientID}&redirect_uri=${redirectUri}`;
let accessToken = undefined;
let expiresIn = undefined;

let Spotify = {
  getAccessToken() {
    if(accessToken) {
      return accessToken;
    }
    const urlAccessToken = window.location.href.match(/access_token=([^&]*)/);
    const urlExpiresIn = window.location.href.match(/expires_in=([^&]*)/);
    if (urlAccessToken && urlExpiresIn) {
      accessToken = urlAccessToken[1];
      expiresIn = urlExpiresIn[1];
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
    } else {
      window.location = spotifyUrl;
    }
  },

  search(searchTerm) {
    let searchUrl = `https://api.spotify.com/v1/search?type=track&q=${searchTerm}`;
    return fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    .then(response => response.json())
    .then(jsonResponse => {
      if (!jsonResponse.tracks) return [];
      return jsonResponse.tracks.items.map(track => {
        return {
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri
        }
      })
    });
  },

  savePlaylist(playlistName, trackURIs) {
    if (!playlistName || !trackURIs) return;
    const userUrl =  'https://api.spotify.com/v1/me';
    const headers = {Authorization: `Bearer ${accessToken}`};
    let userID = undefined;
    let playlistID = undefined;
    fetch(userUrl, {
      headers: headers
    })
    .then(response => response.json())
    .then(jsonResponse => userID = jsonResponse.id)
    .then(() => {
      const createPlaylistUrl = `https://api.spotify.com/v1/users/${userID}/playlists`;
      fetch(createPlaylistUrl, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            name: playlistName
          })
        })
        .then(response => response.json())
        .then(jsonResponse => playlistID = jsonResponse.id)
        .then(() => {
          const addPlaylistTracksUrl = `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`;
          fetch(addPlaylistTracksUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
              uris: trackURIs
            })
          });
        })
    })
  }

};

module.exports = Spotify;
