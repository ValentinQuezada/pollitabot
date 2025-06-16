pre:
	brew install node
	npm install -D typescript
	npm install node-cron

build:
	npm run build

run:
	npm run deploy
	npm run start

dev:
	npm run start:dev
	
tests:
	npx ts-node test.ts
