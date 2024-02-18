.PHONY: build

# Extract version number using awk
VERSION := $(shell awk -F= '/__version__/ {print $$2}' ./app/src/app/__about__.py | tr -d ' "')

# Build the Docker container
build:
	docker build -f Dockerfile -t tinybox-app:$(VERSION) .

run:
	docker run --env-file ./.docker.prod.env -it -p 8669:8000 tinybox-app:$(VERSION)

test-prod: build run