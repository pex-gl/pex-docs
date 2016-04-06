function loadTextBrowser(url, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.onreadystatechange = function (e) {
    if (request.readyState == 4) {
      if (request.status == 200) {
        if (callback) {
          callback(null, request.responseText);
        }
      }
      else {
        callback('WebIO.loadTextFile error : ' + request.statusText, null);
      }
    }
  };
  request.send(null);
}

function showReadme(repo, name) {
    var readmeViewer = document.getElementById('readmeViewer');

    loadTextBrowser('readme/' + name + '/index.html', function(err, html) {
        var a = '<a href="' + repo + '" target="blank">' + repo + '</a>';
        readmeViewer.innerHTML = a + html;
        //console.log(md);
        //console.log(marked(md.replace(/\n/g, '<br/>')));
    })

}
