console.log("Connected");

let currentVolume;
let allfolders = [];
let curFolder;
let currentFolderIndex;
let songs; //global variable to store musics
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  const paddedMins = String(mins).padStart(2, "0");
  const paddedSecs = String(secs).padStart(2, "0");

  return `${paddedMins}:${paddedSecs}`;
}
async function getAlbums() {
  let obj = await fetch(`musics/`);
  let response = await obj.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = Array.from(div.getElementsByTagName("a"));
  let playlistContainer = document.querySelector(".playlistContainer");
  for (let index = 0; index < anchors.length; index++) {
    const element = anchors[index];
    let folder;
    if (element.href.includes("/musics/")) {
      folder = element.href.split("/").slice(-2)[0];
      allfolders.push(folder);
      console.log(folder + " recieved");
      let obj1 = await fetch(`musics/${folder}/info.json`); //json reader
      let response1 = await obj1.json();

      playlistContainer.innerHTML += `
     <div class="card" data-folder="${folder}">
                        <div class="play"><img src="svgs/play.svg" alt="play"></div>
                        <div class="image"><img src="/musics/${folder}/${response1.imgurl}" alt="thumbnail">
                        </div>
                        <div class="Title">${response1.title}</div>
                        <div class="Desc">${response1.desc}</div>
                    </div>
    `;
    }
  }
  //load playlist when card is load
  Array.from(document.getElementsByClassName("card")).forEach((item) => {
    item.addEventListener("click", async (e) => {
      let folderName = e.currentTarget.dataset.folder;
      console.log(folderName + " folder opened");
      currentFolderIndex = allfolders.indexOf(folderName);
      console.log(currentFolderIndex);

      await getSongs(`musics/${folderName}`);
      loadMusic(songs[0]); //songs array gets updated each time u click on another album
      playMusic(songs[0]);
      document.querySelector(".left").style.left = "0%";
    });
  });
}
async function getSongs(folder) {
  curFolder = folder;
  let obj = await fetch(`${curFolder}/`);
  let response = await obj.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let i = 0; i < as.length; i++) {
    if (as[i].href.endsWith(".mp3")) {
      songs.push(as[i].href.split(`/${curFolder}/`)[1]);
    }
  }
  //   console.log(as[0].href);

  //or let songUL = document.querySelector(".libcontent ul");
  //show all the songs in playlist

  let songUL = document
    .querySelector(".libcontent")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = " ";
  for (const music of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `
        <li class="songlistCard">
                            <div class="songThumb"><img src="${curFolder}/thumbnail.jpg" alt="thumbnail"></div>
                            <div class="songinfo">
                                <div class="songName">${
                                  music.replaceAll("%20", " ").split("-")[0]
                                }</div>
                                <div class="songAuthor">${music
                                  .replaceAll("%20", " ")
                                  .split("-")[1]
                                  .replace(".mp3", "")}</div>
                            </div>
                            <div class="songPlay">
                                <img src="svgs/play-button-svgrepo-com.svg" alt="">
                            </div>
                        </li>
                        `;
  }
  let allLi = document.querySelector(".libcontent").getElementsByTagName("li");

  //to retrieve each song address to give it to play fn respectively
  Array.from(allLi).forEach((e) => {
    e.querySelector(".songPlay").addEventListener("click", (Element) => {
      let songAdd =
        e.querySelector(".songName").innerHTML +
        "-" +
        e.querySelector(".songAuthor").innerHTML +
        ".mp3";
      loadMusic(songAdd);
      playMusic();
      document.querySelector(".left").style.left = "-100%";
    });
  });
}
let currentAud = new Audio();

const loadMusic = (track) => {
  currentAud.src = `${curFolder}/` + track;
  document.querySelector(".songdetails").innerHTML = track
    .split("-")[0]
    .replaceAll("%20", "  ");
  document.querySelector(".songDuration").innerHTML = "00:00/04:30";
};
const playMusic = () => {
  play.src = "svgs/pause.svg";
  currentAud.play();
};

async function main() {
  //retrive all albums first 
  await getAlbums();
currentFolderIndex = allfolders.indexOf("Brahmastra"); // Set the initial index



  // //songs accessed from the above location filtered and stored in array
 await getSongs(`musics/${allfolders[0]}`);
loadMusic(decodeURI(songs[0]));
  //to run on reload till the time u play
  //for main play pause next prev buttons
  //play is id of button so easy accessible
  play.addEventListener("click", (e) => {
    if (currentAud.paused) {
      play.src = "svgs/pause.svg";
      currentAud.play();
    } else {
      play.src = "svgs/play-button-svgrepo-com.svg";
      currentAud.pause();
    }
  });
  //to fetch time of song
  currentAud.addEventListener("timeupdate", (e) => {
    document.querySelector(".songDuration").innerHTML = `${formatTime(
      currentAud.currentTime
    )}/${formatTime(currentAud.duration)}`;
    document.querySelector(".timeinstant").style.left =
      (currentAud.currentTime / currentAud.duration) * 100 + "%";
    document.querySelector(".timetrail").style.width =
      (currentAud.currentTime / currentAud.duration) * 100 + "%";
  });
  //add an event listener to seekbar i.e jidhar click udhar pochna
  document.querySelector(".timetrack").addEventListener("click", (e) => {
    const track = e.currentTarget; // Always .timetrack
    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left; // distance from left of full track
    const width = rect.width;

    const currentPercentage = (clickX / width) * 100;

    document.querySelector(".timeinstant").style.left = currentPercentage + "%";
    document.querySelector(".timetrail").style.width = currentPercentage + "%";

    currentAud.currentTime = (currentAud.duration * currentPercentage) / 100;
  });

  //adding an event listener for left sidebar mobile
  document.querySelector("#menuSide").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0%";
  });
  document.querySelector(".cancelSidebar").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });
  //prev next buttons
  prevMusic.addEventListener("click", () => {
    console.log("prev song clicked");
    let index = songs.indexOf(currentAud.src.split("/").slice(-1)[0]);
    console.log(index);

    if (index - 1 >= 0) {
      loadMusic(songs[index - 1]);
      playMusic(songs[index - 1]);
    }
  });

  nextMusic.addEventListener("click", () => {
    console.log("next song clicked");
    let index = songs.indexOf(currentAud.src.split("/").slice(-1)[0]);
    console.log(index);

    if (index + 1 <= songs.length - 1) {
      loadMusic(songs[index + 1]);
      playMusic(songs[index + 1]);
    }
  });
  //for next prev playist etc
  nextPlaylist.addEventListener("click", async () => {
    console.log("next playlist clicked");
    if (currentFolderIndex < allfolders.length-1) {
      currentFolderIndex += 1;
      const nextFolder = allfolders[currentFolderIndex];
      await getSongs(`musics/${nextFolder}`);
      loadMusic(songs[0]);
      playMusic(songs[0]);
    }
  });
  prevPlaylist.addEventListener("click", async () => {
    console.log("prev playlist clicked");
    if (currentFolderIndex>0) {
      currentFolderIndex -= 1;
      const prevFolder = allfolders[currentFolderIndex];
      await getSongs(`musics/${prevFolder}`);
      loadMusic(songs[0]);
      playMusic(songs[0]);
    }
  });
  //for volume control
  let volCn = document.getElementById("volCn");
  volCn.addEventListener("input", (e) => {
    currentAud.volume = e.target.value / 100;
    document.querySelector(".volumeRocker img").src = "svgs/volume.svg";
  });

  volButton.addEventListener("click", (e) => {
    //mute button
    if (e.target.src.includes("svgs/volume.svg")) {
      // e.target.src=e.target.src.replace("svgs/volume.svg","svgs/mute.svg");
      e.target.src = "svgs/mute.svg";
      currentVolume = currentAud.volume;
      currentAud.volume = 0;
      document
        .querySelector(".volumeRocker")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = "svgs/volume.svg";
      currentAud.volume = currentVolume;
      document
        .querySelector(".volumeRocker")
        .getElementsByTagName("input")[0].value = currentVolume * 100;
    }
  });

 
  console.log(allfolders);
}
main();
