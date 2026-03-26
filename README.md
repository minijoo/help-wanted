# Set Up

```
mkdir files
mkdir logs
touch logs/log.txt
```

# Run

```
node index.js
```

# Strats

In the strats folder are scrape strategies for common job posting interfaces like greenhouse and workday. Website-specific ones can be added.


# crontab Example
```bash
# Set path to node executable. 
NODEPATH=/usr/bin

0 9,12,17 * * * yes y | xargs -a <(cat $HOME/help-wanted/TARGETS) $HOME/help-wanted/scripts/main > /tmp/stdout.log 2> /tmp/stderr.log; echo Finished at `date` | tee -a /tmp/stdout.log /tmp/stderr.log &> /dev/null

# For MacOS, xargs '-a' is not an option
6 20 * * * yes | $HOME/workspace/scraper/scripts/main `paste -s -d' ' $HOME/workspace/scraper/TARGETS` > /tmp/stdout.log 2> /tmp/stderr.log; echo Finished at `date` | tee -a /tmp/stdout.log /tmp/stderr.log &> /dev/null
```
