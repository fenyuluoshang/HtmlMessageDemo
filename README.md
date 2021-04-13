# 跨页面的消息传输

> author: [纷羽](https://www.fenyu.club/) 2021/04/07

在日常开发时候我们可能偶尔会有需要在用户打开的多个页面之间传递消息，譬如实现购物车、实现同步登录状态等，或是实现指令操作、通过下达指令来让其他页面配合完成操作

> 本文内容可能不能在IE浏览器中得到有效支持，完整示例代码可以查看[HtmlMessageDemo](https://github.com/fenyuluoshang/HtmlMessageDemo)，或查看线上demo  [域名1-页面](https://blog.fenyu.club/messageDemo/)  [域名2-页面](https://fenyu.club/messageDemo/)

## 不受同源限制的消息传递

非同源下传递消息需要使用[window.postMessage](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage)，那么问题来了，我们需要先拿到对方页面的window

拿到对方window对象的思路就很easy，譬如A页面打开了B页面，通过window.openAPI调用得到的返回值就是新页面的window，但是我们需要等待B页面加载完毕才能有效的发送消息，被打开的B页面也可以通过window.parent来获取页面A的window对象

还有另外一个思路，就是使用iframe标签打开页面，通过id、class等获取到dom对象，dom对象的contentWindow属性就是iframe内的window对象了

或是iframe页面内通过修改url的hash以及父页面修改hash可以实现通讯

> 这里需要额外注意下 `otherWindow.postMessage(message, targetOrigin, \[transfer\]);` 中 `otherWindow` 不能是自身，如果目标非同源，则必须传递 `targetOrigin` 参数（其值可以是字符串"*"）,传空意味着目标必须同源

## 同源下无父子关系的消息传递

以上的消息我们都必须通过父子关系来发送消息，建立传输机制，但是如果两个毫无关联的tab页之间有需要消息往来要怎么办

同源下我们可以通过[web worker](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API)家族(SharedWorker、Worker等)实现消息传递，我们在每个页面下注册Worker时，其实多个页面只注册了一个Worker，后续的页面只是共享到了Worker，通过Worker的js我们可以实现一个同源的跨tab页消息广播，下面是一个广播消息转发的简单实现

> WebWorker在被页面初次注册时初始化，后续被注册时复用，但是受限制于同源下，可能没有IE的有效兼容性。

- sharedworker
```javascript
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
```

- 调用者
```javascript
var worker = new SharedWorker('./worker.js')
worker.port.onmessage = (ev) => {
  console.log(ev)
}
worker.port.start()
worker.port.postMessage({
  message:'hello world'
})
```

## 非同源-非父子传递

那么如果我们想要实现非同源，又能实现消息传递该怎么办

目前我的解决思路是在A.com下使用iframe注入一个B.com的支持页面作为消息转发者，通过iframe建立父子关系发送消息后，由iframe中的页面调用worker进行消息传递和广播。

## 双向的消息连接

页面间双向消息需要先注册[MessageChannel](https://developer.mozilla.org/zh-CN/docs/Web/API/MessageChannel)消息通道，再通过单向消息把通道的一个端点发送到消息的另一方，开启消息通道后使用onmessage监听消息和postMessage向通道发送消息给对方

[MessageChannel](https://developer.mozilla.org/zh-CN/docs/Web/API/MessageChannel) 用于将消息从port1发送给port2或者反过来，从port2发送给port1，使用前面提到过的 [window.postMessage](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage) API中从第3个开始的后续参数，还可以将port丢给其他页面管理，实现页面间的管道双向通讯，前文中SharedWorker的实例的方式就是利用 [MessageChannel](https://developer.mozilla.org/zh-CN/docs/Web/API/MessageChannel) 实现的
