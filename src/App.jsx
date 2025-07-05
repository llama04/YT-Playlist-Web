import './App.css'

export default function App() {

  return (
    <>
      <div id="home">
        <h1 id="title">Youtube Playlist Info</h1>
        <a href="https://youtube.com" target="_blank">
          <img className="logo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1024px-YouTube_full-color_icon_%282017%29.svg.png" />
        </a>
        <form className="card" action="#playlist" method="get">
          <label>Enter Playlist ID:</label><br />
          <input type="text" name="id" className="searchBar" placeholder="ID"></input><button type="submit" className="searchButton"><i className="fa fa-search"></i></button>
        </form>
      </div>

      <div id="playlist">

      </div>

      <div id="about">

      </div>
    </>
  )
}

function SearchPlaylist(){

}