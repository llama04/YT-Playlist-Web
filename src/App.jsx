import './App.css';

var nextPageToken="";

export default function App() {

  return (
    <>
      <div id="navbar">
        <div id="navbar-left">
          <a href="#home">YT Playlist Info</a>
        </div>
        <div id="navbar-button">
          <button href="#register">Register</button>
          <button href="#login">Login</button>
        </div>
        <a className="pageBtn" id ="about-btn" href="#about">About</a>
        <a className="pageBtn" id ="playlist-btn" href="#playlist">Playlist</a>
        <a className="pageBtn" id ="home-btn" href="#home">Home</a>
      </div>


      <section id="home-section">
        <h1 id="title">Youtube Playlist Info</h1>
        <a href="https://youtube.com" target="_blank">
          <img className="logo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1024px-YouTube_full-color_icon_%282017%29.svg.png" />
        </a>
        <form className="card" action="#playlist" method="get">
          <label>Enter Playlist ID:</label><br />
          <input type="text" name="id" className="searchBar" placeholder="ID" required=""></input><button type="submit" className="searchButton"><i className="fa fa-search"></i></button>
          <br /><label className="errorMsg"></label>
        </form>
      </section>
      

      <section id="playlist-section">
        <form className="card" action="#playlist" method="get">
          <label>Enter Playlist ID:</label><br />
          <input type="text" name="id" className="searchBar" placeholder="ID" required=""></input><button type="submit" className="searchButton"><i className="fa fa-search"></i></button>
          <br /><label className="errorMsg"></label>
        </form>

        <img id="pl-cover"/>
        <h2 id="pl-title">Playlist</h2>
        <p id="pl-info"></p>
        <table id="playlistTable">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Channel</th>
              <th>Date Added</th>
            </tr>
          </thead>
          <tbody id="table-body">
          </tbody>
        </table>
      </section>

      <section id="about-section">
        Uses Youtube Data API v3 to access information for any public playlist.
      </section>
    </>
  )
}


window.addEventListener("hashchange", function(){
  loadSection();
})

window.onload = function(){
  loadSection();
  fetchPlaylistId();
}
//-----------------------------------------------------------scripts --------------------------------------------------------------------------

//hides all sections then shows section in url hash (defaults to home)
function loadSection(){
  var sections = document.getElementsByTagName("section");
  for(var i=0;i<sections.length;i++){
    sections[i].style.display = "none";
  }
  var sectionId = location.hash.replace("#","");
  if(sectionId == ""){
    sectionId = "home";
    location.hash = "home";
  }
  document.getElementById(sectionId+"-section").style.display = "block";

  var btns = document.getElementsByClassName("pageBtn");
  for(var i =0;i<btns.length;i++){
    btns[i].className = "pageBtn";
  }
  document.getElementById(sectionId+"-btn").className = "pageBtn active";
}

function GetURLParameter(name){
  var url = new URLSearchParams(document.location.search);
  return url.get(name);
}

function displayId(id){
  var textBoxes = document.getElementsByClassName("searchBar");
  for(var i =0;i<textBoxes.length;i++){
    textBoxes[i].value = id;
  }
}

async function fetchPlaylistId(){
  var id = GetURLParameter("id");
  console.log(id);
  if(id != null){
    if(id != ""){
      displayId(id);
      const response = await getPlaylist(id);
      if(response != undefined){
        const info = response[0];
        const items = response[1];
        updateInfo(info);
        updateTable(items);
      } 
      else{
        sendError("Invalid ID!");
      }
    } else{
      sendError("");
    }
  }
}


//--------------------------------------------------------------------------------------------------------------------------------------------

function updateInfo(info){
  document.getElementById("pl-cover").src = info.cover;
  document.getElementById("pl-title").innerHTML = info.title;
  document.getElementById("pl-info").innerHTML = info.size+" videos<br />(Created On "+info.createdAt.substring(0,10)+ ")"
}
function updateTable(items){
  for(var i =0;i<items.length;i++){
    var video = items[i];
    document.getElementById("table-body").innerHTML += 
      `<tr>
        <td><img height="90px" width="160px" src=${video.thumbnail}></img></td>
        <td>${video.title}</td>
        <td>${video.channel}</td>
        <td>${video.addedOn}</td>
      </tr>`
  }
}
function sendError(txt){
  var msgs = document.getElementsByClassName("errorMsg");
  for(var i =0;i<msgs.length;i++){
    msgs[i].innerHTML = txt;
  }
}

//--------------------------------------------------------------------------------------------------------------------------------------------

//executes search for playlist
async function getPlaylist(id,nextPageToken){

  const apiKey = 'AIzaSyDvQyJ4a8QYS4NPlkNUIQgMjmG54GhJRNA';
  const baseUrl = 'https://youtube.googleapis.com/youtube/v3';

  async function fetchData(URL) {
    try {
      const response = await fetch(URL);
      if (!response.ok) {
        console.error(
          `Error fetching video data:\nStatus: ${response.status}, ${response.statusText}\n\n`
        );
        return;
      }
      const data = await response.json();

      if (data.items.length === 0) {
        console.warn(
          `No video data returned for the playlist ID: ${id}`
        );
        return;
      }

      return data;
    } catch (error) {
      console.error('Error fetching video data:', error);
      return;
    }
  }

  async function execute() {
    //grabbing playlist name+img
    var params = {
      type: 'playlists',
      part: 'contentDetails,snippet',
      fields:
        'items(snippet(title,thumbnails(maxres),publishedAt),contentDetails(itemCount))',
    };
    var URL = `${baseUrl}/${params.type}?part=${params.part}&fields=${params.fields}&id=${id}&key=${apiKey}`;
    var playlist = await fetchData(URL);
    if(playlist == undefined){
      return undefined;
    } else{
      playlist = playlist.items.map((list) => ({
        title: list.snippet.title,
        cover: list.snippet.thumbnails.maxres.url,
        createdAt: list.snippet.publishedAt,
        size: list.contentDetails.itemCount,
      }));
      //grabbing playlist items
      params= {
        type: 'playlistItems',
        part: 'contentDetails,snippet',
        fields:
          'items(snippet(title,thumbnails(default),publishedAt,videoOwnerChannelTitle))',
        maxResults:50,
      };
      URL = `${baseUrl}/${params.type}?part=${params.part}&fields=${params.fields}&maxResults=${params.maxResults}&nextPageToken=${nextPageToken}&playlistId=${id}&key=${apiKey}`;
      var playlistItems = await fetchData(URL);
      playlistItems = playlistItems.items.filter((video) => video.snippet.thumbnails.default != undefined).map((video) => ({
          thumbnail: video.snippet.thumbnails.default.url,
          title: video.snippet.title,
          channel: video.snippet.videoOwnerChannelTitle,
          addedOn: video.snippet.publishedAt.substring(0,10),   
      }));
      return [playlist[0],playlistItems];
    }    
  }
  var data = await execute();
  return data;
}