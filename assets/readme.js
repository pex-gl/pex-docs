function loadTextBrowser (url, callback) {
  var request = new window.XMLHttpRequest()
  request.open('GET', url, true)
  request.onreadystatechange = function (e) {
    if (request.readyState === 4) {
      if (request.status === 200) {
        if (callback) {
          callback(null, request.responseText)
        }
      } else {
        callback('WebIO.loadTextFile error : ' + request.statusText, null)
      }
    }
  }
  request.send(null)
}

function showReadme (repo, name) {
  console.log('showReadme', repo, name)
  var readmeViewer = document.getElementById('readmeViewer')

  loadTextBrowser('readme/' + name + '/index.html', function (err, html) {
    if (err) {
      console.log(err)
      return
    }
    var a = '<a href="' + repo + '" target="blank">' + repo + '</a>'

    readmeViewer.innerHTML = a + html

    var codes = document.querySelectorAll('pre code')
    for (var i = 0; i < codes.length; i++) {
      window.hljs.highlightBlock(codes[i])
    }

    // console.log(md)
    // console.log(marked(md.replace(/\n/g, '<br/>')))
  })

}
