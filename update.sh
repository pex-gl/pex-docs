sed '/^\#/d' repos.txt > repos.txt.tmp
cat repos.txt.tmp | cross-env DEBUG=* ecosystem-docs sync
cat repos.txt.tmp | ecosystem-docs read > repos.json.txt
rm repos.txt.tmp
node build.js
