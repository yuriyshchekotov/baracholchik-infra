.PHONY: run-bots run-bot1 run-bot2

run-bot1:
	cd baracholchik-spy && yarn start

run-bot2:
	cd baracholchik-bot && yarn start

run-bots:
	cd baracholchik-spy && yarn start & \
	cd baracholchik-bot && yarn start

build-bots:
	cd baracholchik-spy && yarn install && yarn build & \
	cd baracholchik-bot && yarn install && yarn build
