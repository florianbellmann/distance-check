#!/bin/bash

# constants
mon=1
tue=2
wed=3
thu=4
fri=5
sat=6
sun=7

# settings
rundays=($sat $sun)
runhours=(7 8 9)
runminutes=(0 10 20 30 40 50)
runseconds=(0)

# helper
echo_time() {
  echo $(date) $1
}
today=$(date +%Y-%m-%d)

# run loop
while true; do
  echo_time ">>> RUNNING"
  echo_time ">>> ..."

  # get now
  now_week_day=$(date +%u)
  now_hour=$(date +%H)
  now_minute=$(date +%M)
  now_second=$(date +%S)

  # calc sleeptime
  diff_days_to_next_run=100
  diff_hours_to_next_run=100
  diff_minutes_to_next_run=100
  diff_seconds_to_next_run=1000
  for runday in ${rundays[@]}; do
    diff_to_run_day=$((runday - now_week_day))
    if [[ $diff_to_run_day -gt 0 && $diff_to_run_day -lt diff_days_to_next_run ]]; then
      diff_days_to_next_run=$diff_to_run_day
    fi
  done

  if [[ $diff_days_to_next_run -gt 0 ]]; then
    diff_hours_to_next_run=${runhours[0]}
    diff_minutes_to_next_run=${runminutes[0]}
    diff_seconds_to_next_run=${runseconds[0]}
  else

    for runhour in ${runhours[@]}; do
      if [[ $runhour -lt $now_hour ]]; then
        runhour=$((runhour + 24))
      fi

      diff_to_run_hour=$((runhour - now_hour))
      if [[ $diff_to_run_hour -gt 0 && $diff_to_run_hour -lt diff_hours_to_next_run ]]; then
        diff_hours_to_next_run=$diff_to_run_hour
      fi
    done
    diff_hours_to_next_run=$((diff_hours_to_next_run - 1))

    for runminute in ${runminutes[@]}; do
      if [[ $runminute -lt $now_minute ]]; then
        runminute=$((runminute + 60))
      fi

      diff_to_run_minute=$((runminute - now_minute))
      if [[ $diff_to_run_minute -gt 0 && $diff_to_run_minute -lt diff_minutes_to_next_run ]]; then
        diff_minutes_to_next_run=$diff_to_run_minute
      fi
    done
    diff_minutes_to_next_run=$((diff_minutes_to_next_run - 1))

    for runsecond in ${runseconds[@]}; do
      if [[ $runsecond -lt $now_second ]]; then
        runsecond=$((runsecond + 60))
      fi

      diff_to_run_second=$((runsecond - now_second))
      if [[ $diff_to_run_second -gt 0 && $diff_to_run_second -lt diff_seconds_to_next_run ]]; then
        diff_seconds_to_next_run=$diff_to_run_second
      fi
    done

  fi
  # wait till next tun
  echo_time ">>> $diff_days_to_next_run days to wait till next run."
  echo_time ">>> $diff_hours_to_next_run hours to wait till next run."
  echo_time ">>> $diff_minutes_to_next_run minutes to wait till next run."
  echo_time ">>> $diff_seconds_to_next_run seconds to wait till next run."
  date -d "$diff_days_to_next_run days $diff_hours_to_next_run hours $diff_minutes_to_next_run minutes $diff_to_run_second seconds"

  sleep 5
done
