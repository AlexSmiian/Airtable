
.PHONY: help up down scale logs clean restart

up:
	ENV=local docker-compose up

scale-2:
	ENV=local docker-compose up --scale backend=2

scale-3:
	ENV=local docker-compose up --scale backend=3

scale-5:
	ENV=local docker-compose up --scale backend=5

down:
	docker-compose down

logs:
	docker-compose logs -f backend

clean:
	docker-compose down -v

restart:
	docker-compose restart backend

status:
	docker-compose ps