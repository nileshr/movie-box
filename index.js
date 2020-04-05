require('dotenv').config();
const Octokit = require("@octokit/rest");
const fetch = require("node-fetch");
const eaw = require('eastasianwidth');

const {
  GH_TOKEN: githubToken,
  GIST_ID: gistId,
  TRAKT_ID: traktId,
  TRAKT_USERNAME: traktUser,
  MOVIE_BOX_MODE: moviBoxMode
} = process.env

const octokit = new Octokit({
  auth: `token ${githubToken}`
});

const API_BASE = 'https://api.trakt.tv/users/luisalejandro/history/movies';

async function main() {
  if (!traktId || !traktUser || !gistId || !githubToken || !moviBoxMode)
    throw new Error('Please check your environment variables, as you are missing one.')

  const data = await fetch(API_BASE, {
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-key': traktId,
      'trakt-api-version': '2',
    }
  });
  const json = await data.json();

  let gist;
  try {
    gist = await octokit.gists.get({
      gist_id: gistId
    });
  } catch (error) {
    console.error(`movie-box ran into an issue getting your Gist:\n${error}`);
  }

  // const numArtitst = Math.min(10, json.topartists.artist.length);
  // let playsTotal = 0;
  // for(let i = 0; i < numArtitst; i++) {
  //   playsTotal += parseInt(json.topartists.artist[i].playcount, 10);
  // }

  // const lines = [];
  // for(let i = 0; i < numArtitst; i++) {
  //   const plays = json.topartists.artist[i].playcount;
  //   let name =  json.topartists.artist[i].name.substring(0, 25);
  //   // trim off long widechars
  //   for(let i = 24; i >= 0; i--) {
  //     if(eaw.length(name) <= 26) break;
  //     name = name.substring(0, i);
  //   }
  //   // pad short strings
  //   name = name.padEnd(26 + name.length - eaw.length(name));

  //   lines.push([
  //     name,
  //     generateBarChart(plays * 100 / playsTotal, 17),
  //     `${plays}`.padStart(5),
  //     'plays'
  //   ].join(' '));
  // }


  const lines = [];
  for(let i = 0; i < 5; i++) {
    let title = json[i].movie.title;
    let watched = json[i].movie.title;
    title = title.padEnd(36 + title.length - eaw.length(name));
    lines.push([
      '',
      title,

    ].join(' '));
  }


  try {
    // Get original filename to update that same file
    const filename = Object.keys(gist.data.files)[0];
    await octokit.gists.update({
      gist_id: gistId,
      files: {
        [filename]: {
          filename: `📺 My last watched movies`,
          content: lines.join("\n")
        }
      }
    });
  } catch (error) {
    console.error(`Unable to update gist\n${error}`);
  }
}

function generateBarChart(percent, size) {
  const syms = "░▏▎▍▌▋▊▉█";

  const frac = Math.floor((size * 8 * percent) / 100);
  const barsFull = Math.floor(frac / 8);
  if (barsFull >= size) {
    return syms.substring(8, 9).repeat(size);
  }
  const semi = frac % 8;

  return [
    syms.substring(8, 9).repeat(barsFull),
    syms.substring(semi, semi + 1),
  ].join("").padEnd(size, syms.substring(0, 1));
}


(async () => {
  await main();
})();