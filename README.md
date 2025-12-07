# Архітектура

Проєкт побудовано за принципом Frontend ↔ BFF ↔ PostgreSQL, з підтримкою realtime-синхронізації та швидким рендерингом великих таблиць.

Frontend: Next/React, TypeScript, TanStack Table + TanStack Virtual, TanStack Query

Rendering: 50k+ рядків через віртуалізовану таблицю (TanStack Table + TanStack Virtual)

Inline editing: (text / number / select / date / decimal)

Optimistic updates: ```TableUpdateProvider``` оновлює TanStack Query кеш

Realtime: WebSocket-клієнт, який приймає ```FIELD_UPDATED``` та оновлює кеш

BFF / API: Node.js + Express

REST: ```/api/records (pagination), /api/health```

WebSocket на: ```/ws (ws, пакет ws)```

Обробка FIELD_UPDATE → handleFieldUpdate → оновлення Postgres → публікація в Redis

DB: PostgreSQL (sql через pg pool)

Pub/Sub: Redis (publish/subscribe) — забезпечує мультиінстансну синхронізацію

Orchestration: Docker Compose (frontend, backend, postgres, redis)

Потік даних:

User edits cell
→ Local optimistic update (React / TanStack Query)
→ Send PATCH to backend (Controller → Service → Queries)
→ Database updated (PostgreSQL)
→ Backend publishes update to Redis
→ WebSocket broadcast to all connected clients
→ Other tabs / clients receive update and sync cell

## Запуск через Makefile

Для максимальної зручності розробника, у проекті використовується **Makefile**, який автоматизує керування Docker Compose.

1.  **Запустіть усе середовище:**
    Ця команда збере образи та запустить Frontend, BFF та PostgreSQL.
    ```bash
    make up
    ```

    > **Примітка:** При першому запуску відбудеться генерація мок-даних у PostgreSQL.

2.  **Тестування Realtime (Масштабування):**
    Ви можете легко протестувати синхронізацію між різними нодами BFF:
    ```bash
    make scale-2
    ```
    Відкрийте дві вкладки, які будуть підключені до різних інстансів BFF, та перевірте синхронізацію.

3.  **Допомога:**
    Для перегляду всіх доступних команд:
    ```bash
    make help
    ```

4.  **Зупинка та очищення:**
    Для зупинки контейнерів:
    ```bash
    make down
    ```
    Для повної зупинки та видалення всіх даних (включно з PostgreSQL):
    ```bash
    make clean
    ```

Ось ключові архітектурні компроміси, прийняті під час розробки цього завдання:

### ADR-001: Реалізація Realtime з Redis Pub/Sub

* **Контекст:** Для підтримки Realtime-синхронізації між клієнтами, підключеними до різних нод BFF (вимога балансування Nginx), потрібен механізм міжсерверної комунікації.
* **Рішення:** Вибрано **Redis Pub/Sub** через його простоту налаштування та легку інтеграцію з Node.js, що ідеально підходить для цього тестового завдання.
* **Компроміс:** Redis Pub/Sub не гарантує доставку повідомлень (якщо нода BFF впаде, повідомлення може бути втрачене). Для production-системи з критичними даними краще було б використовувати **Kafka** або **RabbitMQ** (брокери з гарантованою доставкою та персистентністю), але це значно збільшило б складність.

### ADR-002: Використання Оптимістичних оновлень

* **Контекст:** Вимога плавного UX та миттєвої реакції на inline-редагування.
* **Рішення:** Реалізовано **оптимістичні оновлення** на Frontend (UI оновлюється до підтвердження від BFF).
* **Компроміс:** Існує невеликий ризик конфлікту, коли користувач бачить оновлення, яке пізніше буде відхилено сервером (через помилку валідації або мережевий збій). Це вимагає правильної логіки відкату (`rollback logic`) на клієнті, що додає складності.

### Обмеження, пов'язані з віртуалізацією

* **TanStack Virtual Limits:** Хоча віртуалізація працює чудово, вона ускладнює роботу з невидимими рядками. Наприклад, виконання операцій, що потребують доступу до DOM-елементів *всіх* 50,000 рядків (як-от глобальне виділення або складні CSS-правила) є неможливим/складним. Усі такі операції мають виконуватися на рівні даних (state/PostgreSQL), а не DOM.