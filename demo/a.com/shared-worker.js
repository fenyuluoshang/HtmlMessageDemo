var connects = []
var mid = 1
var mainConnect

onconnect = function(e) {
  var port = e.ports[0];
  var id = mid++

  if (!mainConnect) {
    mainConnect = port
  }

  port.postMessage({
    cmd: 'connect',
    data: {
      id: id
    }
  })

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