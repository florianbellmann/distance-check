#!/bin/zsh

sleepUntil() { # args [-q] <HH[:MM[:SS]]> [more days]
    local slp tzoff now quiet=false
    [ "$1" = "-q" ] && shift && quiet=true
    local -a hms=(${1//:/ })
    printf -v now '%(%s)T' -1
    printf -v tzoff '%(%z)T\n' $now
    tzoff=$((0${tzoff:0:1}(3600*${tzoff:1:2}+60*${tzoff:3:2})))
    slp=$((
       ( 86400+(now-now%86400) + 10#$hms*3600 + 10#${hms[1]}*60 + 
         ${hms[2]}-tzoff-now ) %86400 + ${2:-0}*86400
    ))
    $quiet || printf 'sleep %ss, -> %(%c)T\n' $slp $((now+slp))
    sleep $slp
}


sleepTil(){
  current_epoch=$(date +%s)
  target_epoch=$(date -d '06/16/2022 22:00' +%s)

  sleep_seconds=$(( $target_epoch - $current_epoch ))

  echo $sleep_seconds

}

sleepTil

# sleepUntil 20:10
