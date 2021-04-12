# 一个跨域页面间的通讯的完整实现

我们把a.com下内容设定为主站

index.html 为a.com下部署的聊天窗口

shaderDom.html 为方便其他源下页面实现跨域连接worker的传递者

b.com为子站

b.com发送消息给a.com下的页面时，设计思路为通过b.com使用iframe引入a.com下的shaderDom.html，通过父子关系，使用window.postMessage

shaderDom.html将消息调起worker实现传输

这里使用的worker是shared-worker