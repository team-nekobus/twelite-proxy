var path = require('path')
    , serialport = require('serialport')
    ,	net = require('net');

var TWE_LITE_MESSAGE_LENGTH = 50;
var portName = '/dev/ttyUSB0';
var connections = [];
var sp;


if (process.argv.length >= 3 && process.argv[2].indexOf('/dev/tty') === 0) {
	portName = process.argv[2];
}

var server = net.createServer(function(conn) { //'connection' listener
  console.log('connected');
  connections.push(conn);
  conn.on('end', function() {
    console.log('disconnected');
    connections.splice(connections.indexOf(conn), 1);
  });
});

server.listen(9943, function() { //'listening' listener
  console.log('server bound');
  connectSerial(portName);
});

function connectSerial(serialDevice) {
	console.log('serial port: ', serialDevice);
	var config = {
	  baudRate: 115200,
	  dataBits: 8,
	  parity: 'none',
	  stopBits: 1,
	  flowControl: false,
	  parser: serialport.parsers.readline("\n")
	};
	sp = new serialport.SerialPort(serialDevice, config); 
	sp.on('data', ondata);
	sp.on('error', function(e) {
		console.error(e);
		setTimeout(connectSerial.bind(undefined, serialDevice), 1000);
	});
}

function ondata(data) {
  if (data.length === TWE_LITE_MESSAGE_LENGTH && data[0] === ':') {
	  console.log(data);
  	connections.forEach(function(conn) {
		  try {
  			conn.write(data+'\n');
		  } catch(e) {
		  	console.error(e);
			  connections.splice(connections.indexOf(conn), 1);
		  }
  	});
  }
}

