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
NODEPATH=/usr/local/bin # change this depending on system. Linux should be /usr/bin. Use "which node" to double-check
# 9:45 every day, run scraper script with args taken from TARGETS file (paste transposes lines into arguments)
37 19 * * * yes | $HOME/workspace/scraper/scripts/main `paste -s -d' ' $HOME/workspace/scraper/TARGETS` > /tmp/stdout.log 2> /tmp/stderr.log; echo Finished at `date` | tee -a /tmp/stdout.log /tmp/stderr.log &> /dev/null
```
