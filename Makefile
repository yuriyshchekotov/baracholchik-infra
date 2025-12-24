.PHONY: run-bots run-bot1 run-bot2

run-spy:
	cd baracholchik-spy && yarn start

run-bot:
	cd baracholchik-bot && yarn start

run-spy-dev:
	cd baracholchik-spy && yarn dev

run-bot-dev:
	cd baracholchik-bot && yarn dev

run-bots:
	cd baracholchik-spy && yarn start & \
	cd baracholchik-bot && yarn start

build-bots:
	cd baracholchik-spy && yarn install && yarn build & \
	cd baracholchik-bot && yarn install && yarn build
