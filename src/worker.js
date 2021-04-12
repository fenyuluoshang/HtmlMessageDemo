var connects = []
onconnect = function(e) {
  var port = e.ports[0];
  
  port.addEventListener('message', function(e) {
    connects.forEach(item=>{
      try {
        item.postMessage(e.data)
      } catch (error) {
      }
    })
  });

  connects.push(port)

  port.start();
}