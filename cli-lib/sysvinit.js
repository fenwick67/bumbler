// create pm2 yaml file

var fs = require('fs');
var path = require('path');

module.exports = function(){
  var user = process.env.USER || 'root';
  var cwd = process.cwd();
  var filename = path.join(process.cwd(),'./bumbler.sh');
  var text =
`
#!/bin/sh
### BEGIN INIT INFO
# Provides:          bumbler
# Required-Start:    $local_fs $network $named $time $syslog
# Required-Stop:     $local_fs $network $named $time $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Description:       microblog software
### END INIT INFO

SCRIPT="$(command -v bumbler) --dir='${cwd}'"
RUNAS=${user}

PIDFILE=/var/run/bumbler.pid
LOGFILE=/var/log/bumbler.log

start() {
  if [ -f /var/run/$PIDNAME ] && kill -0 $(cat /var/run/$PIDNAME); then
    echo 'Service already running' >&2
    return 1
  fi
  echo 'Starting service…' >&2
  local CMD="$SCRIPT &> \"$LOGFILE\" & echo \$!"
  su -c "$CMD" $RUNAS > "$PIDFILE"
  echo 'Service started' >&2
}

stop() {
  if [ ! -f "$PIDFILE" ] || ! kill -0 $(cat "$PIDFILE"); then
    echo 'Service not running' >&2
    return 1
  fi
  echo 'Stopping service…' >&2
  kill -15 $(cat "$PIDFILE") && rm -f "$PIDFILE"
  echo 'Service stopped' >&2
}

uninstall() {
  echo -n "Are you really sure you want to uninstall this service? That cannot be undone. [yes|No] "
  local SURE
  read SURE
  if [ "$SURE" = "yes" ]; then
    stop
    rm -f "$PIDFILE"
    echo "Notice: log file is not be removed: '$LOGFILE'" >&2
    update-rc.d -f <NAME> remove
    rm -fv "$0"
  fi
}

case "$1" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  uninstall)
    uninstall
    ;;
  retart)
    stop
    start
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|uninstall}"
esac

`

  fs.writeFileSync(filename, text, 'utf8');
  fs.chmodSync(filename, '755');
  console.log(
`Wrote a file called "bumbler.sh", which is a SysVInit service script.

Move the file to /etc/init.d/bumbler.sh to create a service, then you can use sysvinit commands (like 'service start bumbler') to manage startup.

The process will be ran as you (${user}) for the bumbler installation here at ${cwd}`
  );
  return;
}
