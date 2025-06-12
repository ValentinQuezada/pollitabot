# Makefile for building and running the pollitabot project

# Variables
PYTHON=python3
SRC=main.py

# Pre requisites
pre:
	brew install node
	npm install -D typescript
	npm install node-cron

build:
	npm run build

run:
	npm run deploy
	npm run start

tests:
	npx ts-node test.ts
