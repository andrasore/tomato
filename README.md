tomato
======

Tomato is a basic pomodoro timer for node.js (pomodoro means tomato in italian). Work and break lengths can optionally be customised using a config YAML. Notifications are sent using `node-notifier`.

Usage
-----
    Usage: tom [options]

    A basic cli pomodoro timer

    Options:
      -V, --version        output the version number
      -r, --recipe <name>  Recipe name to use (default: "default")
      --stats              Print today's stats
      -h, --help           display help for command
    Example config (~/.tomrc.yml or ./.tomrc.yml):

    default:
      timeUnit: minutes
      workTime: 25
      breakTime: 5
      repeat: 1
    leisure:
      workTime: 5
      breakTime: 5

    All recipe fields will default to the default recipe's values when not
    defined.