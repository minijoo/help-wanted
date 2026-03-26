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
SHELL=/bin/bash
MAILTO=minijoo@gmail.com
NODEPATH=/usr/bin
PATH=$PATH:/usr/bin
0 9,12,17 * * * cat $HOME/help-wanted/TARGETS | xargs $HOME/help-wanted/scripts/main > /tmp/stdout.log 2> /tmp/stderr.log; echo Finished at `date` | tee -a /tmp/stdout.log /tmp/stderr.log &> /dev/null;
```
