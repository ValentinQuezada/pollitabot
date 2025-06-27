pre:
	brew install node
	npm install -D typescript
	npm install node-cron
	npm install date-fns date-fns-tz

build:
	npm run build

run:
	npm run deploy
	npm run start

dev:
	npm run start:dev
	
tests:
	npx ts-node test.ts

date:
	npm install date-fns date-fns-tz