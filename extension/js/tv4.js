// TV4
// Example URL:
// https://www.tv4.se/nyhetsmorgon/klipp/n%C3%A4men-h%C3%A4r-sover-peter-dalle-under-tommy-k%C3%B6rbergs-framtr%C3%A4dande-3349622
// Data URL:
// https://playback-api.b17g.net/asset/3349622?service=tv4&device=browser&drm=&protocol=hls%2Cdash
// https://playback-api.b17g.net/media/3349622?service=tv4&device=browser&protocol=hls%2Cdash&is_clip=true
//
// TV4 Play
// Example URL:
// https://www.tv4play.se/program/nyheterna/3349759
// Data URL:
// https://playback-api.b17g.net/asset/3349759?service=tv4&device=browser&drm=widevine&protocol=hls%2Cdash
// https://playback-api.b17g.net/media/3349759?service=tv4&device=browser&protocol=hls%2Cdash&drm=widevine&is_clip=true
//
// could probably avoid the request to /asset/ and just grab the tab title for the filename.
// is_clip seem to be optional:
// https://playback-api.b17g.net/asset/3349759?service=tv4&device=browser&protocol=hls%2Cdash
// https://playback-api.b17g.net/media/3349759?service=tv4&device=browser&protocol=hls%2Cdash
//
// drm is required:
// https://www.tv4play.se/program/maria-lang/10001026
// https://playback-api.b17g.net/asset/10001026?service=tv4&device=browser&drm=widevine&protocol=hls%2Cdash
//
// Multiple items:
// https://www.tv4play.se/program/jul-med-ernst/3946707
// https://playback-api.b17g.net/asset/3946707?service=tv4&device=browser&protocol=hls%2Cdash
// https://playback-api.b17g.net/media/3946707?service=tv4&device=browser&protocol=hls%2Cdash


function tv4play_asset_callback() {
  console.log(this)
  if (this.status != 200) {
    api_error(this.responseURL, this.status)
    return
  }

  var data = JSON.parse(this.responseText)
  var season_number = (`${data.metadata.seasonNumber}`)
  var episode_number = (`${data.metadata.episodeNumber}`)
  if (season_number <= 9) season_number = (`0${season_number}`)
  if (episode_number <= 9) episode_number = (`0${episode_number}`)
  update_filename(`${data.metadata.seriesTitle} S${season_number}E${episode_number}.mp4`)

  var media_url = `https://playback-api.b17g.net${data.mediaUri}`
  console.log(media_url)
  var xhr = new XMLHttpRequest()
  xhr.addEventListener("load", tv4play_media_callback)
  xhr.open("GET", media_url)
  xhr.send()
}

function tv4play_media_callback() {
  console.log(this)
  if (this.status != 200) {
    api_error(this.responseURL, this.status)
    return
  }

  var data = JSON.parse(this.responseText)
  var dropdown = $("#streams")
  var option = document.createElement("option")
  option.value = data.playbackItem.manifestUrl
  option.appendChild(document.createTextNode(data.playbackItem.type))
  dropdown.appendChild(option)

  update_cmd()
}

matchers.push({
  re: /^https?:\/\/(?:www\.)?tv4(?:play)?\.se\/.*(?:-|\/)(\d+)/,
  func: function(ret) {
    var video_id = ret[1]
    var data_url = `https://playback-api.b17g.net/asset/${video_id}?service=tv4&device=browser&drm=widevine&protocol=hls%2Cdash`
    update_filename(`${video_id}.mp4`)
    $("#open_json").href = data_url

    console.log(data_url)
    var xhr = new XMLHttpRequest()
    xhr.addEventListener("load", tv4play_asset_callback)
    xhr.open("GET", data_url)
    xhr.send()
  }
})
