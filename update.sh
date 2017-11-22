sed '/^\#/d' repos.txt > repos.txt.tmp
cat repos.txt.tmp | DEBUG=ecosystem-docs ./node_modules/.bin/ecosystem-docs sync
cat repos.txt.tmp | ./node_modules/.bin/ecosystem-docs read > repos.json.txt
rm repos.txt.tmp
